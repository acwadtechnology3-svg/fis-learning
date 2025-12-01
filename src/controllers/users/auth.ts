import { Request, Response } from "express";
import { saveBase64Image } from "../../utils/handleImages";
import { db } from "../../models/db";
import { emailVerification, parents, users } from "../../models/schema";
import { eq, and, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { SuccessResponse } from "../../utils/response";
import { randomInt } from "crypto";
import {
  ForbiddenError,
  NotFound,
  UnauthorizedError,
  UniqueConstrainError,
  DatabaseError,
} from "../../Errors";
import { generateToken } from "../../utils/auth";
import { sendEmail } from "../../utils/sendEmails";
import { BadRequest } from "../../Errors/BadRequest";


export const signup = async (req: Request, res: Response) => {
  const data = req.body;

  const whereConditions = [eq(users.email, data.email)];
  if (data.phone) {
    whereConditions.push(eq(users.phone, data.phone));
  }

  let existing;
  [existing] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      password: users.password,
      phone: users.phone,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(or(...whereConditions));

  // لو اليوزر موجود
  if (existing) {
    if (existing.isVerified) {
      if (existing.email === data.email) {
        throw new UniqueConstrainError(
          "Email",
          "User already signup with this email"
        );
      }
      if (data.phone && existing.phone === data.phone) {
        throw new UniqueConstrainError(
          "Phone",
          "User already signup with this phone number"
        );
      }
    }

    // لو NOT verified - ابعت كود جديد
    if (!existing.isVerified && existing.email === data.email) {
      const code = randomInt(100000, 999999).toString();

      await db
        .delete(emailVerification)
        .where(eq(emailVerification.userId, existing.id));

      await db.insert(emailVerification).values({
        userId: existing.id,
        code,
        expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      });

      await sendEmail(
        existing.email,
        "Email Verification",
        `Your verification code is ${code}`
      );

      return SuccessResponse(
        res,
        {
          message: "Verification code resent to your email",
          userId: existing.id,
        },
        200
      );
    }
  }

  // يوزر جديد تماماً
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const code = randomInt(100000, 999999).toString();

  const newUser = {
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone || null,
    level: data.level || null,
    year:
      data.year &&
      ["1stYear", "2ndYear", "3rdYear", "4thYear", "5thYear"].includes(data.year)
        ? data.year
        : "1stYear",
    fcmToken: data.fcmToken || null,
    googleId: data.googleId || null,
    isVerified: req.user ? true : false,
  };

  const [insertedUser] = await db.insert(users).values(newUser).returning();

  // ✅ لو اليوزر عنده رقم تليفون، سجّله في جدول parents
  if (data.phone) {
    // تحقق إن الرقم مش موجود في parents كـ studentPhone
    const [existingParentEntry] = await db
      .select()
      .from(parents)
      .where(eq(parents.userPhone, data.phone));

    if (!existingParentEntry) {
      await db.insert(parents).values({
        password: "Pending",
        userPhone: data.phone,
        isVerified: false,
        userId: insertedUser.id,
      });
    }
  }

  if (!req.user) {
    await db.insert(emailVerification).values({
      userId: insertedUser.id,
      code,
      expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    });

    await sendEmail(
      data.email,
      "Email Verification",
      `Your verification code is ${code}`
    );

    return SuccessResponse(
      res,
      {
        message: "User Signup successfully, get verification code from gmail",
        userId: insertedUser.id,
      },
      201
    );
  } else {
    return SuccessResponse(
      res,
      {
        message: "User Signup successfully",
        userId: insertedUser.id,
      },
      201
    );
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  let user;
  try {
    user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    });
  } catch (error: any) {
    throw new DatabaseError("Failed to query user", error.message || error);
  }

  if (!user) throw new NotFound("User not found");

  let record;
  try {
    record = await db.query.emailVerification.findFirst({
      where: (ev, { eq }) => eq(ev.userId, user.id),
    });
  } catch (error: any) {
    throw new DatabaseError("Failed to query verification code", error.message || error);
  }

  if (!record || record.code !== code)
    throw new BadRequest("Invalid verification code");

    await db.update(users).set({ isVerified: true }).where(eq(users.id, user.id));
    await db
      .delete(emailVerification)
      .where(eq(emailVerification.userId, user.id));
  

  SuccessResponse(res, { message: "Email verified successfully" }, 200);
};

export const login = async (req: Request, res: Response) => {
  const data = req.body;

  let user;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });
  } catch (error: any) {
    throw new DatabaseError("Failed to query user", error.message || error);
  }

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  let isMatch: boolean;
  try {
    isMatch = await bcrypt.compare(data.password, user.password);
  } catch (error: any) {
    throw new DatabaseError("Password comparison failed", error.message || error);
  }

  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.isVerified) {
    throw new ForbiddenError("Verify your email first");
  }

  let token: string;
    token = generateToken({
      id: user.id,
      name: user.name,
      role: "user",
    });
  

  SuccessResponse(res, { message: "Login successful", token: token, user: user.email, name: user.name, phone:user.phone, role: user.role }, 200);
};

export const getFcmToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.user!.id;

  await db.update(users).set({ fcmToken: token }).where(eq(users.id, Number(userId)));
  res.json({ success: true });
};

export const sendResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;

  let user;
  try {
    [user] = await db.select().from(users).where(eq(users.email, email));
  } catch (error: any) {
    throw new DatabaseError("Failed to query user", error.message || error);
  }

  if (!user) throw new NotFound("User not found");
  if (!user.isVerified)
    throw new BadRequest("User is not verified");

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await db
      .delete(emailVerification)
      .where(eq(emailVerification.userId, user.id));

    await db
      .insert(emailVerification)
      .values({
        code: code,
        userId: user.id,
        expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      });
  } catch (error: any) {
    throw new DatabaseError("Failed to save reset code", error.message || error);
  }

  try {
    await sendEmail(
      email,
      "Password Reset Code",
      `Your reset code is: ${code}\nIt will expire in 2 hours.`
    );
  } catch (error: any) {
    // If email fails, still return success but log the error
    console.error("Failed to send reset code email:", error);
    // Optionally throw if you want to fail the request when email fails
    // throw new DatabaseError("Failed to send reset code email", error.message || error);
  }

  SuccessResponse(res, { message: "Reset code sent to your email" }, 200);
};

export const verifyCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  let user;
  try {
    [user] = await db.select().from(users).where(eq(users.email, email));
  } catch (error: any) {
    throw new DatabaseError("Failed to query user", error.message || error);
  }

  if (!user) throw new NotFound("User not found");

  let rowcode;
  try {
    [rowcode] = await db
      .select()
      .from(emailVerification)
      .where(eq(emailVerification.userId, user.id));
  } catch (error: any) {
    throw new DatabaseError("Failed to query verification code", error.message || error);
  }

  if (!rowcode || rowcode.code !== code) {
    throw new BadRequest("Invalid email or reset code");
  }

  SuccessResponse(res, { message: "Code verified successfully" }, 200);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;

  let user;
  try {
    [user] = await db.select().from(users).where(eq(users.email, email));
  } catch (error: any) {
    throw new DatabaseError("Failed to query user", error.message || error);
  }

  if (!user) throw new NotFound("User not found");

  let rowcode;
  try {
    [rowcode] = await db
      .select()
      .from(emailVerification)
      .where(
        and(
          eq(emailVerification.userId, user.id),
          eq(emailVerification.code, code)
        )
      );
  } catch (error: any) {
    throw new DatabaseError("Failed to query verification code", error.message || error);
  }

  if (!rowcode) throw new BadRequest("Invalid reset code");

  let hashed: string;
  try {
    hashed = await bcrypt.hash(newPassword, 10);
  } catch (error: any) {
    throw new DatabaseError("Failed to hash password", error.message || error);
  }

  try {
    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, user.id));

    await db
      .delete(emailVerification)
      .where(eq(emailVerification.userId, user.id));
  } catch (error: any) {
    throw new DatabaseError("Failed to reset password", error.message || error);
  }

  SuccessResponse(res, { message: "Password reset successfully" }, 200);
};
