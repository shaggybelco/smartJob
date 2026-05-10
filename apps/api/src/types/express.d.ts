import type { Role } from "@smartjob/shared";

// Augment Express's Request so middleware can attach userId / userRole.
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userRole?: Role;
  }
}

export {};
