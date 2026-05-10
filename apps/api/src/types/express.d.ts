declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "APPLICANT" | "RECRUITER";
    }
  }
}

export {};
