import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");
export const CHAT_UPLOADS_DIR = path.resolve(UPLOADS_DIR, "chat");

export const ACCEPTED_RESUME_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export const ACCEPTED_CHAT_MIMES = new Set([
  ...ACCEPTED_RESUME_MIMES,
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
export const MAX_CHAT_BYTES = 10 * 1024 * 1024;
