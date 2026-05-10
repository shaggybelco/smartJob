import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

/**
 * Single PrismaClient instance shared across the whole process.
 *
 * - Opens a connection pool to the database the first time a query runs.
 * - Imported only by repositories. Services/controllers never touch this directly.
 * - In tests we can swap this out by mocking the repository module.
 */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
