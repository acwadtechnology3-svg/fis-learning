"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const promises_1 = __importDefault(require("fs/promises"));
const Errors_1 = require("../Errors");
/**
 * Gathers all uploaded files from the request (single file, array of files, or object of file arrays)
 */
function gatherFiles(req) {
    const files = [];
    if (req.file) {
        files.push(req.file);
    }
    if (req.files) {
        if (Array.isArray(req.files)) {
            files.push(...req.files);
        }
        else {
            Object.values(req.files)
                .flat()
                .forEach((file) => {
                if (file)
                    files.push(file);
            });
        }
    }
    return files;
}
/**
 * Safely deletes uploaded files if validation fails
 */
async function cleanupFiles(files) {
    const deleteOps = files.map(async (file) => {
        if (file.path) {
            try {
                await promises_1.default.unlink(file.path);
            }
            catch (error) {
                // Log error but don't throw - file cleanup failure shouldn't break the flow
                console.error(`Failed to delete file ${file.path}:`, error);
            }
        }
    });
    await Promise.all(deleteOps);
}
/**
 * Formats Zod validation errors into a more readable structure
 */
function formatZodErrors(error) {
    return error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join(".") : "unknown",
        message: issue.message,
    }));
}
/**
 * Validation middleware that validates request body, query, and params using Zod schemas
 * Stores validated data back to the request object
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Parse and validate the request data
            const validatedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Store validated data back to request object
            // This ensures controllers receive sanitized and validated data
            if (validatedData.body) {
                req.body = validatedData.body;
            }
            if (validatedData.query) {
                req.query = validatedData.query;
            }
            if (validatedData.params) {
                req.params = validatedData.params;
            }
            next();
        }
        catch (error) {
            // Handle Zod validation errors
            if (error instanceof zod_1.ZodError) {
                // Clean up any uploaded files since validation failed
                const files = gatherFiles(req);
                await cleanupFiles(files);
                // Format errors and throw ValidationError for consistent error handling
                const formattedErrors = formatZodErrors(error);
                throw new Errors_1.ValidationError("Validation failed", formattedErrors);
            }
            // Pass other errors to the error handler
            next(error);
        }
    };
};
exports.validate = validate;
