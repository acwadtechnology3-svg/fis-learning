import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to: string, message: string) => {
  try {
    // تأكد إن الرقم بصيغة دولية
    const formattedPhone = to.startsWith("+") ? to : `+2${to}`; // مصر

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`✅ SMS sent to ${formattedPhone}`);
  } catch (error) {
    console.error("❌ SMS Error:", error);
    throw new Error("Failed to send SMS");
  }
};