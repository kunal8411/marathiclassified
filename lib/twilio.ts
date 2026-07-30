import twilio from "twilio";

export async function sendOtpSms(to: string, code: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    console.info(`[DEV OTP SMS] to=${to} code=${code}`);
    return;
  }

  const client = twilio(sid, token);
  await client.messages.create({
    from,
    to,
    body: `Your Marathi Classifieds code is ${code}. Valid for 10 minutes.`,
  });
}
