"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyCode = exports.sendResetCode = exports.getFcmToken = exports.login = exports.verifyEmail = exports.signup = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const response_1 = require("../../utils/response");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const auth_1 = require("../../utils/auth");
const sendEmails_1 = require("../../utils/sendEmails");
const BadRequest_1 = require("../../Errors/BadRequest");
const signup = async (req, res) => {
    const data = req.body;
    const whereConditions = [(0, drizzle_orm_1.eq)(schema_1.users.email, data.email)];
    if (data.phone) {
        whereConditions.push((0, drizzle_orm_1.eq)(schema_1.users.phone, data.phone));
    }
    let existing;
    [existing] = await db_1.db
        .select({
        id: schema_1.users.id,
        name: schema_1.users.name,
        email: schema_1.users.email,
        password: schema_1.users.password,
        phone: schema_1.users.phone,
        isVerified: schema_1.users.isVerified,
    })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.or)(...whereConditions));
    // لو اليوزر موجود
    if (existing) {
        if (existing.isVerified) {
            if (existing.email === data.email) {
                throw new Errors_1.UniqueConstrainError("Email", "User already signup with this email");
            }
            if (data.phone && existing.phone === data.phone) {
                throw new Errors_1.UniqueConstrainError("Phone", "User already signup with this phone number");
            }
        }
        // لو NOT verified - ابعت كود جديد
        if (!existing.isVerified && existing.email === data.email) {
            const code = (0, crypto_1.randomInt)(100000, 999999).toString();
            await db_1.db
                .delete(schema_1.emailVerification)
                .where((0, drizzle_orm_1.eq)(schema_1.emailVerification.userId, existing.id));
            await db_1.db.insert(schema_1.emailVerification).values({
                userId: existing.id,
                code,
                expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
            });
            await (0, sendEmails_1.sendEmail)(existing.email, "Email Verification", `Your verification code is ${code}`);
            return (0, response_1.SuccessResponse)(res, {
                message: "Verification code resent to your email",
                userId: existing.id,
            }, 200);
        }
    }
    // يوزر جديد تماماً
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const newUser = {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone || null,
        level: data.level || null,
        year: data.year &&
            ["1stYear", "2ndYear", "3rdYear", "4thYear", "5thYear"].includes(data.year)
            ? data.year
            : "1stYear",
        fcmToken: data.fcmToken || null,
        googleId: data.googleId || null,
        isVerified: req.user ? true : false,
    };
    const [insertedUser] = await db_1.db.insert(schema_1.users).values(newUser).returning();
    // ✅ لو اليوزر عنده رقم تليفون، سجّله في جدول parents
    if (data.phone) {
        // تحقق إن الرقم مش موجود في parents كـ studentPhone
        const [existingParentEntry] = await db_1.db
            .select()
            .from(schema_1.parents)
            .where((0, drizzle_orm_1.eq)(schema_1.parents.userPhone, data.phone));
        if (!existingParentEntry) {
            await db_1.db.insert(schema_1.parents).values({
                password: "Pending",
                userPhone: data.phone,
                isVerified: false,
                userId: insertedUser.id,
            });
        }
    }
    if (!req.user) {
        await db_1.db.insert(schema_1.emailVerification).values({
            userId: insertedUser.id,
            code,
            expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        });
        await (0, sendEmails_1.sendEmail)(data.email, "Email Verification", `Your verification code is ${code}`);
        return (0, response_1.SuccessResponse)(res, {
            message: "User Signup successfully, get verification code from gmail",
            userId: insertedUser.id,
        }, 201);
    }
    else {
        return (0, response_1.SuccessResponse)(res, {
            message: "User Signup successfully",
            userId: insertedUser.id,
        }, 201);
    }
};
exports.signup = signup;
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;
    let user;
    try {
        user = await db_1.db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, userId),
        });
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query user", error.message || error);
    }
    if (!user)
        throw new Errors_1.NotFound("User not found");
    let record;
    try {
        record = await db_1.db.query.emailVerification.findFirst({
            where: (ev, { eq }) => eq(ev.userId, user.id),
        });
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query verification code", error.message || error);
    }
    if (!record || record.code !== code)
        throw new BadRequest_1.BadRequest("Invalid verification code");
    await db_1.db.update(schema_1.users).set({ isVerified: true }).where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
    await db_1.db
        .delete(schema_1.emailVerification)
        .where((0, drizzle_orm_1.eq)(schema_1.emailVerification.userId, user.id));
    (0, response_1.SuccessResponse)(res, { message: "Email verified successfully" }, 200);
};
exports.verifyEmail = verifyEmail;
const login = async (req, res) => {
    const data = req.body;
    let user;
    try {
        user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, data.email),
        });
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query user", error.message || error);
    }
    if (!user) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    let isMatch;
    try {
        isMatch = await bcrypt_1.default.compare(data.password, user.password);
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Password comparison failed", error.message || error);
    }
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    if (!user.isVerified) {
        throw new Errors_1.ForbiddenError("Verify your email first");
    }
    let token;
    token = (0, auth_1.generateToken)({
        id: user.id,
        name: user.name,
        role: "user",
    });
    (0, response_1.SuccessResponse)(res, { message: "Login successful", token: token, user: user.email, name: user.name, phone: user.phone, role: user.role }, 200);
};
exports.login = login;
const getFcmToken = async (req, res) => {
    const { token } = req.body;
    const userId = req.user.id;
    await db_1.db.update(schema_1.users).set({ fcmToken: token }).where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(userId)));
    res.json({ success: true });
};
exports.getFcmToken = getFcmToken;
const sendResetCode = async (req, res) => {
    const { email } = req.body;
    let user;
    try {
        [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query user", error.message || error);
    }
    if (!user)
        throw new Errors_1.NotFound("User not found");
    if (!user.isVerified)
        throw new BadRequest_1.BadRequest("User is not verified");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        await db_1.db
            .delete(schema_1.emailVerification)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerification.userId, user.id));
        await db_1.db
            .insert(schema_1.emailVerification)
            .values({
            code: code,
            userId: user.id,
            expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        });
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to save reset code", error.message || error);
    }
    try {
        await (0, sendEmails_1.sendEmail)(email, "Password Reset Code", `Your reset code is: ${code}\nIt will expire in 2 hours.`);
    }
    catch (error) {
        // If email fails, still return success but log the error
        console.error("Failed to send reset code email:", error);
        // Optionally throw if you want to fail the request when email fails
        // throw new DatabaseError("Failed to send reset code email", error.message || error);
    }
    (0, response_1.SuccessResponse)(res, { message: "Reset code sent to your email" }, 200);
};
exports.sendResetCode = sendResetCode;
const verifyCode = async (req, res) => {
    const { email, code } = req.body;
    let user;
    try {
        [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query user", error.message || error);
    }
    if (!user)
        throw new Errors_1.NotFound("User not found");
    let rowcode;
    try {
        [rowcode] = await db_1.db
            .select()
            .from(schema_1.emailVerification)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerification.userId, user.id));
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query verification code", error.message || error);
    }
    if (!rowcode || rowcode.code !== code) {
        throw new BadRequest_1.BadRequest("Invalid email or reset code");
    }
    (0, response_1.SuccessResponse)(res, { message: "Code verified successfully" }, 200);
};
exports.verifyCode = verifyCode;
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    let user;
    try {
        [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query user", error.message || error);
    }
    if (!user)
        throw new Errors_1.NotFound("User not found");
    let rowcode;
    try {
        [rowcode] = await db_1.db
            .select()
            .from(schema_1.emailVerification)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.emailVerification.userId, user.id), (0, drizzle_orm_1.eq)(schema_1.emailVerification.code, code)));
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to query verification code", error.message || error);
    }
    if (!rowcode)
        throw new BadRequest_1.BadRequest("Invalid reset code");
    let hashed;
    try {
        hashed = await bcrypt_1.default.hash(newPassword, 10);
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to hash password", error.message || error);
    }
    try {
        await db_1.db
            .update(schema_1.users)
            .set({ password: hashed })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        await db_1.db
            .delete(schema_1.emailVerification)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerification.userId, user.id));
    }
    catch (error) {
        throw new Errors_1.DatabaseError("Failed to reset password", error.message || error);
    }
    (0, response_1.SuccessResponse)(res, { message: "Password reset successfully" }, 200);
};
exports.resetPassword = resetPassword;
