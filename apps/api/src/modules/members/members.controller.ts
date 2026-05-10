import { asyncHandler } from "../../lib/asyncHandler.js";
import { MembersService } from "./members.service.js";

export const MembersController = {
  list: asyncHandler(async (req, res) => {
    const result = await MembersService.list(req.userId!);
    res.json(result.list.map((m) => ({
      id: m.id,
      email: m.email,
      name: m.name,
      membership: m.companyMembership,
      createdAt: m.createdAt.toISOString(),
      isMe: m.id === result.meId,
    })));
  }),

  approve: asyncHandler(async (req, res) => {
    await MembersService.approve(req.userId!, req.params.id!);
    res.status(204).end();
  }),

  promote: asyncHandler(async (req, res) => {
    await MembersService.promote(req.userId!, req.params.id!);
    res.status(204).end();
  }),

  demote: asyncHandler(async (req, res) => {
    await MembersService.demote(req.userId!, req.params.id!);
    res.status(204).end();
  }),

  revoke: asyncHandler(async (req, res) => {
    await MembersService.revoke(req.userId!, req.params.id!);
    res.status(204).end();
  }),
};
