import { Request, Response } from "express";
import { db } from "../../models/db";
import { admins, parents, smsVerification, users } from "../../models/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/auth";
import { NotFound, UnauthorizedError, UniqueConstrainError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { randomInt } from "crypto";
import { sendSMS } from "../../utils/sendSMS";

export const parentSignup = async (req: Request, res: Response) => {
    const { password, userPhone } = req.body;
  
    // 1. تحقق إن رقم الطالب موجود في الـ users
    const [student] = await db
      .select({
        id: users.id,
        phone: users.phone,
        name: users.name,
        isVerified: users.isVerified,
      })
      .from(users)
      .where(eq(users.phone, userPhone));
  
    if (!student) {
      throw new NotFound(
        "Student",
        "No student found with this phone number"
      );
    }
  
    if (!student.isVerified) {
      throw new BadRequest("Student account is not verified yet");
    }
  
    // 2. تحقق إن مفيش parent مسجل قبل كده لنفس الطالب
    const [existingParent] = await db
      .select()
      .from(parents)
      .where(eq(parents.userId, student.id));
  
    const code = randomInt(100000, 999999).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
  
    let parentId: number;
  
    if (existingParent) {
      // لو موجود و verified - ارجع error
      if (existingParent.isVerified) {
        throw new UniqueConstrainError(
          "Parent",
          "A parent is already registered for this student"
        );
      }
  
      // لو موجود و NOT verified - حدّث الباسورد وابعت كود جديد
      await db
        .update(parents)
        .set({ password: hashedPassword })
        .where(eq(parents.id, existingParent.id));
  
      parentId = existingParent.id;
    } else {
      // أنشئ parent جديد
      const [newParent] = await db
        .insert(parents)
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
    await db
      .delete(smsVerification)
      .where(eq(smsVerification.parentId, parentId));
  
    // 4. أضف كود جديد
    await db.insert(smsVerification).values({
      parentId,
      code,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000), // 10 دقايق
    });
  
    // 5. ابعت SMS للطالب
    await sendSMS(
      userPhone,
      `Your parent verification code is: ${code}. Share this with your parent.`
    );
  
    return SuccessResponse(
      res,
      {
        message: "Verification code sent to student's phone",
        parentId,
        studentName: student.name,
      },
      201
    );
  };
  


  export const verifyParent = async (req: Request, res: Response) => {
    const { parentId, code } = req.body;
  
    // 1. جيب الـ verification record
    const [verification] = await db
      .select()
      .from(smsVerification)
      .where(eq(smsVerification.parentId, parentId));
  
    if (!verification) {
      throw new NotFound(
        "Verification",
        "No verification code found. Please request a new one."
      );
    }
  
    // 2. تحقق من الـ expiration
    if (new Date() > verification.expiredAt) {
      await db
        .delete(smsVerification)
        .where(eq(smsVerification.id, verification.id));
  
      throw new BadRequest(
        "Verification code has expired. Please request a new one."
      );
    }
  
    // 3. تحقق من الكود
    if (verification.code !== code) {
      throw new BadRequest("Invalid verification code");
    }
  
    // 4. حدّث الـ parent ليكون verified
    await db
      .update(parents)
      .set({ isVerified: true })
      .where(eq(parents.id, parentId));
  
    // 5. احذف الـ verification record
    await db
      .delete(smsVerification)
      .where(eq(smsVerification.id, verification.id));
  
    return SuccessResponse(
      res,
      {
        message: "Parent verified successfully. You can now login.",
      },
      200
    );
  };
  


  export const parentLogin = async (req: Request, res: Response) => {
    const { userPhone, password } = req.body;
  
    // 1. جيب الـ parent
    const [parent] = await db
      .select()
      .from(parents)
      .where(eq(parents.userPhone, userPhone));
  
    if (!parent) {
      throw new NotFound("Parent", "No parent found with this student phone");
    }
  
    // 2. تحقق من الـ verification
    if (!parent.isVerified) {
      throw new UnauthorizedError("Please verify your account first");
    }
  
    // 3. تحقق من الباسورد
    const isValidPassword = await bcrypt.compare(password, parent.password);
  
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid password");
    }
  
    // 4. أنشئ الـ token
    const token = generateToken({
      id: parent.id,
      name: parent.userPhone,
      role: "parent",
    });
  
    return SuccessResponse(
      res,
      {
        message: "Login successful",
        token,
        parent: {
          id: parent.id,
          userPhone: parent.userPhone,
          userId: parent.userId,
        },
      },
      200
    );
  };
  

  export const resendParentCode = async (req: Request, res: Response) => {
    const { parentId } = req.body;
  
    const [parent] = await db
      .select()
      .from(parents)
      .where(eq(parents.id, parentId));
  
    if (!parent) {
      throw new NotFound("Parent", "Parent not found");
    }
  
    if (parent.isVerified) {
      throw new BadRequest("Parent is already verified");
    }
  
    const code = randomInt(100000, 999999).toString();
  
    // احذف الكود القديم
    await db
      .delete(smsVerification)
      .where(eq(smsVerification.parentId, parentId));
  
    // أضف كود جديد
    await db.insert(smsVerification).values({
      parentId,
      code,
      expiredAt: new Date(Date.now() + 10 * 60 * 1000),
    });
  
    // ابعت SMS
    await sendSMS(parent.userPhone, `Your verification code is: ${code}`);
  
    return SuccessResponse(
      res,
      {
        message: "Verification code resent",
        parentId,
      },
      200
    );
  };
  