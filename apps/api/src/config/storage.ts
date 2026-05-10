import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the api package root regardless of where Node is invoked from.
// __dirname is not available in ESM, so we compute it.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Absolute path to apps/api/uploads/. Created on demand. */
export const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads");

/** Allowed CV mime types. */
export const ACCEPTED_RESUME_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

export const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
