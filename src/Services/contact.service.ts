import { ApiError } from "@/lib/api/api-error";
import { pageMeta } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/auth-guard";
import { enforceRateLimit, HOUR, MINUTE } from "@/lib/rate-limit";
import {
  contactMessageRepository,
  type ContactMessageRecord,
} from "@/Repositories/contact-message.repository";
import type { MessageStatus } from "@/Schemas/common.schema";
import {
  CONTACT_HONEYPOT_FIELD,
  type ContactSubmitInput,
  type MessageListQuery,
  type MessageUpdateInput,
} from "@/Schemas/contact.schema";
import { activityService } from "@/Services/activity.service";
import { notificationService } from "@/Services/notification.service";
import { settingsService } from "@/Services/settings.service";

/*
 * Contact form inbox. Not an editorial module (no publish workflow), so it has
 * its own repository and service instead of createContentService.
 */

export type ContactMessageDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
  replyDraft: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toContactMessageDto(record: ContactMessageRecord): ContactMessageDto {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    company: record.company,
    subject: record.subject,
    message: record.message,
    status: record.status,
    replyDraft: record.replyDraft,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function getRecord(id: string) {
  const record = await contactMessageRepository.findById(id);
  if (!record) throw ApiError.notFound("Message not found.");
  return record;
}

export const contactService = {
  /**
   * Public form. The route always answers 202, so a filled honeypot is
   * dropped silently and looks like success to the bot.
   */
  async submit(input: ContactSubmitInput, ip: string): Promise<void> {
    enforceRateLimit(
      [`contact:ip:${ip}`, { limit: 5, windowMs: 15 * MINUTE }],
      [`contact:ip-hour:${ip}`, { limit: 20, windowMs: HOUR }],
    );
    if (input[CONTACT_HONEYPOT_FIELD]) return;

    const record = await contactMessageRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      subject: input.subject,
      message: input.message,
    });

    const { contactEmail } = await settingsService.get();
    if (contactEmail) {
      notificationService.sendContactAlert(contactEmail, record);
    } else {
      console.warn("[contact] No contact email in workspace settings; staff alert not sent.");
    }
  },

  async list(query: MessageListQuery) {
    const { items, total } = await contactMessageRepository.list(query);
    return { items: items.map(toContactMessageDto), meta: pageMeta(query.page, query.pageSize, total) };
  },

  async get(id: string) {
    return toContactMessageDto(await getRecord(id));
  },

  async update(id: string, input: MessageUpdateInput, actor: Actor) {
    const existing = await getRecord(id);
    const record = await contactMessageRepository.update(id, input);
    const changes = [
      input.status !== undefined && input.status !== existing.status ? `status → ${input.status}` : null,
      input.replyDraft !== undefined && input.replyDraft !== existing.replyDraft ? "reply draft" : null,
    ].filter(Boolean);
    if (changes.length) {
      await activityService.record(actor, {
        action: "updated",
        entityType: "contact_message",
        entityId: id,
        summary: `Updated message from ${record.email} (${changes.join(", ")})`,
      });
    }
    return toContactMessageDto(record);
  },

  async remove(id: string, actor: Actor) {
    const existing = await getRecord(id);
    await contactMessageRepository.delete(id);
    await activityService.record(actor, {
      action: "deleted",
      entityType: "contact_message",
      entityId: id,
      summary: `Deleted message from ${existing.email}`,
    });
    return { id };
  },

  countUnread() {
    return contactMessageRepository.countByStatus("NEW");
  },
};
