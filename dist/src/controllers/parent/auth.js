"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendParentCode = exports.parentLogin = exports.verifyParent = exports.parentSignup = void 0;
const db_1 = require("../../models/db");
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_1 = require("../../utils/auth");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const crypto_1 = require("crypto");
const sendSMS_1 = require("../../utils/sendSMS");
const parentSignup = async (req, res) => {
    const { password, userPhone } = req.body;
    // 1. تحقق إن رقم الطالب موجود في الـ users
    const [student] = await db_1.db
        .select({
        id: schema_1.users.id,
        phone: schema_1.users.phone,
        name: schema_1.users.name,
        isVerified: schema_1.users.isVerified,
    })
        .from(schema_1.users)
        .where((0, drizzle_orm_1.eq)(schema_1.users.phone, userPhone));
    if (!student) {
        throw new Errors_1.NotFound("Student", "No student found with this phone number");
    }
    if (!student.isVerified) {
        throw new BadRequest_1.BadRequest("Student account is not verified yet");
    }
    // 2. تحقق إن مفيش parent مسجل قبل كده لنفس الطالب
    const [existingParent] = await db_1.db
        .select()
        .from(schema_1.parents)
        .where((0, drizzle_orm_1.eq)(schema_1.parents.userId, student.id));
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    let parentId;
    if (existingParent) {
        // لو موجود و verified - ارجع error
        if (existingParent.isVerified) {
            throw new Errors_1.UniqueConstrainError("Parent", "A parent is already registered for this student");
        }
        // لو موجود و NOT verified - حدّث الباسورد وابعت كود جديد
        await db_1.db
            .update(schema_1.parents)
            .set({ password: hashedPassword })
            .where((0, drizzle_orm_1.eq)(schema_1.parents.id, existingParent.id));
        parentId = existingParent.id;
    }
    else {
        // أنشئ parent جديد
        const [newParent] = await db_1.db
            .insert(schema_1.parents)
            .values({
            userPhone,
            password: hashedPassword,
            isVerified: false,
            userId: student.id,
        })
            .returning();
        parentId = newParent.id;
    }
    // 3. احذف أي كود قديم
    await db_1.db
        .delete(schema_1.smsVerification)
        .where((0, drizzle_orm_1.eq)(schema_1.smsVerification.parentId, parentId));
    // 4. أضف كود جديد
    await db_1.db.insert(schema_1.smsVerification).values({
        parentId,
        code,
        expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 دقايق
    });
    // 5. ابعت SMS للطالب
    await (0, sendSMS_1.sendSMS)(userPhone, `Your parent verification code is: ${code}. Share this with your parent.`);
    return (0, response_1.SuccessResponse)(res, {
        message: "Verification code sent to student's phone",
        parentId,
        studentName: student.name,
    }, 201);
};
exports.parentSignup = parentSignup;
const verifyParent = async (req, res) => {
    const { parentId, code } = req.body;
    // 1. جيب الـ verification record
    const [verification] = await db_1.db
        .select()
        .from(schema_1.smsVerification)
        .where((0, drizzle_orm_1.eq)(schema_1.smsVerification.parentId, parentId));
    if (!verification) {
        throw new Errors_1.NotFound("Verification", "No verification code found. Please request a new one.");
    }
    // 2. تحقق من الـ expiration
    if (new Date() > verification.expiredAt) {
        await db_1.db
            .delete(schema_1.smsVerification)
            .where((0, drizzle_orm_1.eq)(schema_1.smsVerification.id, verification.id));
        throw new BadRequest_1.BadRequest("Verification code has expired. Please request a new one.");
    }
    // 3. تحقق من الكود
    if (verification.code !== code) {
        throw new BadRequest_1.BadRequest("Invalid verification code");
    }
    // 4. حدّث الـ parent ليكون verified
    await db_1.db
        .update(schema_1.parents)
        .set({ isVerified: true })
        .where((0, drizzle_orm_1.eq)(schema_1.parents.id, parentId));
    // 5. احذف الـ verification record
    await db_1.db
        .delete(schema_1.smsVerification)
        .where((0, drizzle_orm_1.eq)(schema_1.smsVerification.id, verification.id));
    return (0, response_1.SuccessResponse)(res, {
        message: "Parent verified successfully. You can now login.",
    }, 200);
};
exports.verifyParent = verifyParent;
const parentLogin = async (req, res) => {
    const { userPhone, password } = req.body;
    // 1. جيب الـ parent
    const [parent] = await db_1.db
        .select()
        .from(schema_1.parents)
        .where((0, drizzle_orm_1.eq)(schema_1.parents.userPhone, userPhone));
    if (!parent) {
        throw new Errors_1.NotFound("Parent", "No parent found with this student phone");
    }
    // 2. تحقق من الـ verification
    if (!parent.isVerified) {
        throw new Errors_1.UnauthorizedError("Please verify your account first");
    }
    // 3. تحقق من الباسورد
    const isValidPassword = await bcrypt_1.default.compare(password, parent.password);
    if (!isValidPassword) {
        throw new Errors_1.UnauthorizedError("Invalid password");
    }
    // 4. أنشئ الـ token
    const token = (0, auth_1.generateToken)({
        id: parent.id,
        name: parent.userPhone,
        role: "parent",
    });
    return (0, response_1.SuccessResponse)(res, {
        message: "Login successful",
        token,
        parent: {
            id: parent.id,
            userPhone: parent.userPhone,
            userId: parent.userId,
        },
    }, 200);
};
exports.parentLogin = parentLogin;
const resendParentCode = async (req, res) => {
    const { parentId } = req.body;
    const [parent] = await db_1.db
        .select()
        .from(schema_1.parents)
        .where((0, drizzle_orm_1.eq)(schema_1.parents.id, parentId));
    if (!parent) {
        throw new Errors_1.NotFound("Parent", "Parent not found");
    }
    if (parent.isVerified) {
        throw new BadRequest_1.BadRequest("Parent is already verified");
    }
    const code = (0, crypto_1.randomInt)(100000, 999999).toString();
    // احذف الكود القديم
    await db_1.db
        .delete(schema_1.smsVerification)
        .where((0, drizzle_orm_1.eq)(schema_1.smsVerification.parentId, parentId));
    // أضف كود جديد
    await db_1.db.insert(schema_1.smsVerification).values({
        parentId,
        code,
        expiredAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    // ابعت SMS
    await (0, sendSMS_1.sendSMS)(parent.userPhone, `Your verification code is: ${code}`);
    return (0, response_1.SuccessResponse)(res, {
        message: "Verification code resent",
        parentId,
    }, 200);
};
exports.resendParentCode = resendParentCode;
