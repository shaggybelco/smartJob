import type { LoginInput, RegisterInput } from "@smartjob/shared";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { signToken } from "../../lib/jwt.js";
import { HttpError } from "../../middleware/error.js";
import {
  CompanyRepository,
  UserRepository,
  type UserPublic,
} from "./auth.repository.js";

const issueToken = (user: UserPublic) =>
  signToken({ sub: user.id, email: user.email });

export const AuthService = {
  async register(input: RegisterInput): Promise<{ user: UserPublic; token: string }> {
    if (await UserRepository.findByEmail(input.email)) {
      throw new HttpError(409, "Email already registered");
    }

    const passwordHash = await hashPassword(input.password);

    let companyId: string | undefined;
    if (input.role === "RECRUITER") {
      const company = await CompanyRepository.upsertByName(input.companyName!.trim());
      companyId = company.id;
    }

    const user = await UserRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      companyId,
    });

    return { user, token: issueToken(user) };
  },

  async login(input: LoginInput): Promise<{ user: UserPublic; token: string }> {
    const found = await UserRepository.findByEmailWithHash(input.email);
    if (!found) throw new HttpError(401, "Invalid credentials");

    const ok = await verifyPassword(input.password, found.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    // strip passwordHash before returning
    const { passwordHash: _ph, ...user } = found;
    return { user, token: issueToken(user) };
  },

  async me(userId: string): Promise<UserPublic> {
    const user = await UserRepository.findPublicById(userId);
    if (!user) throw new HttpError(401, "User no longer exists");
    return user;
  },
};

/** Shape that goes out the wire (Date → ISO string). */
export const serializeUser = (user: UserPublic) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt.toISOString(),
  company: user.company,
});
