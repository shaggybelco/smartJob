import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";
import {
  ACCEPTED_RESUME_MIMES,
  MAX_RESUME_BYTES,
  UPLOADS_DIR,
} from "../config/storage.js";
import { HttpError } from "./error.js";

// Make sure the uploads directory exists before multer tries to write into it.
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const sanitize = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = sanitize(path.basename(file.originalname, ext));
    cb(null, `${randomUUID()}-${base}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ACCEPTED_RESUME_MIMES.has(file.mimetype)) {
    return cb(new HttpError(400, `Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

/** `req.file` will be the uploaded resume (key: "resume" in the form data). */
export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_RESUME_BYTES },
}).single("resume");
