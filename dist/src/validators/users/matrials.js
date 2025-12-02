"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMaterialSchema = void 0;
const zod_1 = require("zod");
exports.createMaterialSchema = zod_1.z.object({ body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        courseId: zod_1.z.string().min(1),
        file: zod_1.z.instanceof(File),
    }).strict() });
