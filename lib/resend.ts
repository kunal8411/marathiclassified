import { Resend } from "resend";
import { siteConfig } from "@/config/site";

let client: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL ?? "Marathi Classifieds <onboarding@resend.dev>";

  if (!resend) {
    console.info(`[DEV OTP EMAIL] to=${to} code=${code}`);
    return;
  }

  await resend.emails.send({
    from,
    to,
    subject: `${siteConfig.name} verification code`,
    html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in ${siteConfig.otpExpiryMinutes} minutes.</p>`,
  });
}
