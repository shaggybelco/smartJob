import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { prisma } from "../../config/prisma.js";
import { CompaniesController } from "./companies.controller.js";

const router = Router();

// Public typeahead search for the registration form
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const where = q
      ? { name: { contains: q, mode: "insensitive" as const } }
      : undefined;
    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: "asc" },
      take: 20,
      select: { id: true, name: true },
    });
    res.json(companies);
  }),
);

router.get("/:id", CompaniesController.detail);

export default router;
