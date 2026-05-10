import { HttpError } from "../../middleware/error.js";
import { RecruiterRepository } from "../jobs/jobs.repository.js";
import { MemberRepository } from "./members.repository.js";

const requireAdminCompany = async (userId: string) => {
  const recruiter = await RecruiterRepository.findCompanyId(userId);
  if (!recruiter?.companyId) throw new HttpError(403, "No company");
  return recruiter as { id: string; companyId: string };
};

const ensureNotLastAdmin = async (companyId: string, targetMembership: string | null) => {
  if (targetMembership === "ADMIN") return;
  const adminCount = await MemberRepository.countAdmins(companyId);
  if (adminCount <= 1) {
    throw new HttpError(400, "Cannot demote or remove the last admin of a company");
  }
};

export const MembersService = {
  async list(userId: string) {
    const me = await requireAdminCompany(userId);
    return {
      list: await MemberRepository.list(me.companyId),
      meId: me.id,
    };
  },

  async approve(userId: string, targetUserId: string) {
    const me = await requireAdminCompany(userId);
    const target = await MemberRepository.findInCompany(targetUserId, me.companyId);
    if (!target) throw new HttpError(404, "User not in your company");
    if (target.companyMembership !== "PENDING") return target;
    return MemberRepository.setMembership(target.id, "APPROVED");
  },

  async promote(userId: string, targetUserId: string) {
    const me = await requireAdminCompany(userId);
    const target = await MemberRepository.findInCompany(targetUserId, me.companyId);
    if (!target) throw new HttpError(404, "User not in your company");
    if (target.companyMembership === "ADMIN") return target;
    return MemberRepository.setMembership(target.id, "ADMIN");
  },

  async demote(userId: string, targetUserId: string) {
    const me = await requireAdminCompany(userId);
    if (targetUserId === me.id) {
      await ensureNotLastAdmin(me.companyId, "APPROVED");
    }
    const target = await MemberRepository.findInCompany(targetUserId, me.companyId);
    if (!target) throw new HttpError(404, "User not in your company");
    if (target.companyMembership !== "ADMIN") return target;
    await ensureNotLastAdmin(me.companyId, "APPROVED");
    return MemberRepository.setMembership(target.id, "APPROVED");
  },

  async revoke(userId: string, targetUserId: string) {
    const me = await requireAdminCompany(userId);
    const target = await MemberRepository.findInCompany(targetUserId, me.companyId);
    if (!target) throw new HttpError(404, "User not in your company");
    if (target.companyMembership === "ADMIN") {
      await ensureNotLastAdmin(me.companyId, null);
    }
    return MemberRepository.removeFromCompany(target.id);
  },
};
