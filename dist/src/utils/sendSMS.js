"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSMS = void 0;
const twilio_1 = __importDefault(require("twilio"));
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const sendSMS = async (to, message) => {
    try {
        // تأكد إن الرقم بصيغة دولية
        const formattedPhone = to.startsWith("+") ? to : `+2${to}`; // مصر
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone,
        });
        console.log(`✅ SMS sent to ${formattedPhone}`);
    }
    catch (error) {
        console.error("❌ SMS Error:", error);
        throw new Error("Failed to send SMS");
    }
};
exports.sendSMS = sendSMS;
