import {
  ApplicationsListQuery,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@smartjob/shared";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { ApplicationsService } from "./applications.service.js";

export const ApplicationsController = {
  list: asyncHandler(async (req, res) => {
    const q = ApplicationsListQuery.parse(req.query);
    res.json(await ApplicationsService.list(req.userId!, q));
  }),

  create: asyncHandler(async (req, res) => {
    const input = CreateApplicationInput.parse(req.body);
    const created = await ApplicationsService.create(req.userId!, input);
    res.status(201).json(created);
  }),

  detail: asyncHandler(async (req, res) => {
    res.json(await ApplicationsService.getOwned(req.params.id!, req.userId!));
  }),

  update: asyncHandler(async (req, res) => {
    const input = UpdateApplicationInput.parse(req.body);
    res.json(await ApplicationsService.update(req.params.id!, req.userId!, input));
  }),

  remove: asyncHandler(async (req, res) => {
    await ApplicationsService.remove(req.params.id!, req.userId!);
    res.status(204).end();
  }),
};
