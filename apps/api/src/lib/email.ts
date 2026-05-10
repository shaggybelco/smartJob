import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";

let cachedTransporter: Transporter | null = null;

const buildTransporter = (): Transporter => {
  if (env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    });
  }
  return nodemailer.createTransport({ jsonTransport: true });
};

const transporter = () => (cachedTransporter ??= buildTransporter());

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendMail = async (msg: MailMessage) => {
  const result = await transporter().sendMail({
    from: env.MAIL_FROM,
    ...msg,
  });
  if (env.NODE_ENV !== "test" && !env.SMTP_HOST) {
    // eslint-disable-next-line no-console
    console.log(`[mail:dev] to=${msg.to} subject=${msg.subject}`);
  }
  return result;
};
