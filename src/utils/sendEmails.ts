import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, text: string) => {
  console.log("📧 Attempting to send email...");
  console.log("To:", to);
  console.log("From:", process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true, // تفعيل الـ debug
    logger: true, // طباعة الـ logs
  });

  // اختبر الاتصال الأول
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
  } catch (verifyError) {
    console.error("❌ SMTP verification failed:", verifyError);
    throw verifyError;
  }

  // ابعت الإيميل
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });

  console.log("✅ Email sent:", info.messageId);
  return info;
};
