import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { CHAT_UPLOADS_DIR, ACCEPTED_CHAT_MIMES, MAX_CHAT_BYTES } from "../../config/storage.js";
import { HttpError } from "../../middleware/error.js";

fs.mkdirSync(CHAT_UPLOADS_DIR, { recursive: true });

const sanitize = (name: string) =>
  name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, CHAT_UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = sanitize(path.basename(file.originalname, ext));
    cb(null, `${randomUUID()}-${base}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ACCEPTED_CHAT_MIMES.has(file.mimetype)) {
    return cb(new HttpError(400, `Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const chatUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_CHAT_BYTES, files: 5 },
}).array("attachments", 5);
