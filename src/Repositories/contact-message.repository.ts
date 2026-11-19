import type { ContactMessage, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { pageArgs, searchFilter, withPrismaErrors, type ListResult } from "@/Repositories/repository-utils";
import type { MessageStatus } from "@/Schemas/common.schema";

export type ContactMessageRecord = ContactMessage;

const ENTITY = "Message";

export const contactMessageRepository = {
  create(data: {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    subject: string | null;
    message: string;
  }): Promise<ContactMessageRecord> {
    return getPrisma().contactMessage.create({ data });
  },

  async list(params: {
    search?: string;
    status?: MessageStatus;
    page: number;
    pageSize: number;
  }): Promise<ListResult<ContactMessageRecord>> {
    const where: Prisma.ContactMessageWhereInput = {
      ...searchFilter(["name", "email", "company", "subject", "message"], params.search),
      ...(params.status ? { status: params.status } : {}),
    };
    const prisma = getPrisma();
    const [items, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...pageArgs(params.page, params.pageSize),
      }),
      prisma.contactMessage.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<ContactMessageRecord | null> {
    return getPrisma().contactMessage.findUnique({ where: { id } });
  },

  update(id: string, data: { status?: MessageStatus; replyDraft?: string | null }) {
    return withPrismaErrors(() => getPrisma().contactMessage.update({ where: { id }, data }), ENTITY);
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().contactMessage.delete({ where: { id } }), ENTITY);
  },

  countByStatus(status: MessageStatus): Promise<number> {
    return getPrisma().contactMessage.count({ where: { status } });
  },
};
