import type { Prisma, User } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { pageArgs, searchFilter, withPrismaErrors, type ListResult } from "@/Repositories/repository-utils";
import type { UserRole, UserStatus } from "@/Schemas/common.schema";

export type UserRecord = User;

export type UserListParams = {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page: number;
  pageSize: number;
};

export const userRepository = {
  findById(id: string): Promise<UserRecord | null> {
    return getPrisma().user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<UserRecord | null> {
    return getPrisma().user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async list(params: UserListParams): Promise<ListResult<UserRecord>> {
    const where: Prisma.UserWhereInput = {
      ...searchFilter(["name", "email"], params.search),
      ...(params.role ? { role: params.role } : {}),
      ...(params.status ? { status: params.status } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().user.findMany({
        where,
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
        ...pageArgs(params.page, params.pageSize),
      }),
      getPrisma().user.count({ where }),
    ]);
    return { items, total };
  },

  create(data: { email: string; name: string; role: UserRole; passwordHash?: string | null }) {
    return withPrismaErrors(
      () => getPrisma().user.create({ data: { ...data, email: data.email.toLowerCase() } }),
      "User",
    );
  },

  update(
    id: string,
    data: Partial<{ name: string; role: UserRole; status: UserStatus; passwordHash: string; preferences: Prisma.InputJsonValue }>,
  ) {
    return withPrismaErrors(() => getPrisma().user.update({ where: { id }, data }), "User");
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().user.delete({ where: { id } }), "User");
  },

  /** Active admins, optionally excluding one user (to test "would this remove the last admin?"). */
  countActiveAdmins(excludeId?: string): Promise<number> {
    return getPrisma().user.count({
      where: { role: "ADMIN", status: "ACTIVE", ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  },

  touchLastLogin(id: string) {
    return getPrisma().user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  },
};
