import { randomUUID } from "node:crypto";

import { ApiError } from "@/lib/api/api-error";
import { zodDetails } from "@/lib/api/request";
import { pageMeta } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/auth-guard";
import { GENERAL_APPLICATION_LABEL, normalisePhone } from "@/lib/careers/application-form";
import { checkCv } from "@/lib/careers/cv-file";
import { destroyPrivateRaw, privateRawDownloadUrl, uploadPrivateRaw } from "@/lib/cloudinary";
import { enforceRateLimit, HOUR, MINUTE } from "@/lib/rate-limit";
import { jobApplicationRepository, type JobApplicationRecord } from "@/Repositories/job-application.repository";
import {
  APPLICATION_HONEYPOT_FIELD,
  applicationFieldsSchema,
  type ApplicationListQuery,
  type ApplicationUpdateInput,
} from "@/Schemas/job-application.schema";
import type { ApplicationStatus } from "@/Schemas/common.schema";
import { activityService } from "@/Services/activity.service";
import { notificationService } from "@/Services/notification.service";
import { settingsService } from "@/Services/settings.service";
import { vacancyService } from "@/Services/vacancy.service";

/*
 * Job applications (careers). Not an editorial module: own repository and
 * service, like the contact inbox.
 *
 * Privacy: CVs live in Cloudinary as authenticated raw files. The public ID
 * never leaves the server; staff get a 10-minute signed link through
 * GET /api/admin/applications/[id]/cv, and each view is logged. Applicant
 * details are never written to the server log.
 */

const DUPLICATE_WINDOW_MS = 24 * HOUR;

/** Admin view. No cvPublicId: downloads go through the signed-link route. */
export type JobApplicationDto = {
  id: string;
  positionLabel: string;
  vacancy: { id: string; slug: string; title: string } | null;
  fullName: string;
  email: string;
  phone: string;
  message: string | null;
  cvFilename: string;
  cvBytes: number;
  consent: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export function toJobApplicationDto(record: JobApplicationRecord): JobApplicationDto {
  return {
    id: record.id,
    positionLabel: record.positionLabel,
    vacancy: record.vacancy ? { id: record.vacancy.id, slug: record.vacancy.slug, title: record.vacancy.title } : null,
    fullName: record.fullName,
    email: record.email,
    phone: record.phone,
    message: record.message,
    cvFilename: record.cvFilename,
    cvBytes: record.cvBytes,
    consent: record.consent,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function getRecord(id: string) {
  const record = await jobApplicationRepository.findById(id);
  if (!record) throw ApiError.notFound("Application not found.");
  return record;
}

export type SubmitResult = { status: 201; id: string } | { status: 202 };

export const jobApplicationService = {
  /**
   * Public form (multipart). Order: rate limit, honeypot, validation (incl.
   * consent), open vacancy, duplicate check, CV check, upload, insert
   * (the upload is deleted if the insert fails), emails.
   */
  async submit(form: FormData, ip: string): Promise<SubmitResult> {
    enforceRateLimit(
      [`apply:ip:${ip}`, { limit: 5, windowMs: 15 * MINUTE }],
      [`apply:ip-hour:${ip}`, { limit: 20, windowMs: HOUR }],
    );

    const fields: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) if (typeof value === "string") fields[key] = value;
    if (typeof fields[APPLICATION_HONEYPOT_FIELD] === "string" && fields[APPLICATION_HONEYPOT_FIELD]) {
      return { status: 202 };
    }

    const parsed = applicationFieldsSchema.safeParse(fields);
    const cvEntry = form.get("cv");
    if (!parsed.success) {
      // Report the CV too, so the form can show every problem at once.
      const details = zodDetails(parsed.error);
      if (!cvEntry || typeof cvEntry === "string") details.cv = "Attach your CV";
      throw ApiError.validation("Some fields need your attention.", details);
    }
    const input = parsed.data;

    let vacancyId: string | null = null;
    let positionLabel = GENERAL_APPLICATION_LABEL;
    if (input.vacancyId) {
      const vacancy = await vacancyService.findOpenForApplication(input.vacancyId);
      if (!vacancy) {
        throw ApiError.validation("This vacancy is no longer open.", {
          vacancyId: "This vacancy is no longer open. You can still send a general application.",
        });
      }
      vacancyId = vacancy.id;
      positionLabel = vacancy.title;
    }

    // Before any upload, so a duplicate stores nothing.
    const recent = await jobApplicationRepository.countRecent(input.email, vacancyId, new Date(Date.now() - DUPLICATE_WINDOW_MS));
    if (recent > 0) {
      throw ApiError.conflict(
        vacancyId
          ? "You have already applied for this position in the last 24 hours. We have your application."
          : "You have already sent a general application in the last 24 hours. We have your application.",
        { email: "An application from this email address was received in the last 24 hours" },
      );
    }

    const cv = await checkCv(cvEntry);
    if ("error" in cv) throw ApiError.validation("Please check your CV.", { cv: cv.error });

    const uploaded = await uploadPrivateRaw({
      bytes: cv.bytes,
      filename: cv.filename,
      mime: cv.mime,
      publicId: `${randomUUID()}.${cv.kind}`,
    }).catch((error: unknown) => {
      console.error("[applications] CV upload failed:", error instanceof Error ? error.message : "unknown error");
      throw new ApiError(502, "INTERNAL_ERROR", "We could not upload your CV just now. Please try again.");
    });

    const message =
      [input.areaOfInterest && !vacancyId ? `Area of interest: ${input.areaOfInterest}` : null, input.message ?? null]
        .filter(Boolean)
        .join("\n\n") || null;

    let record: JobApplicationRecord;
    try {
      record = await jobApplicationRepository.create({
        vacancyId,
        positionLabel,
        fullName: input.fullName,
        email: input.email,
        phone: normalisePhone(input.phone),
        message,
        cvPublicId: uploaded.publicId,
        cvFilename: cv.filename,
        cvBytes: cv.size,
        consent: true,
      });
    } catch (error) {
      await destroyPrivateRaw(uploaded.publicId).catch(() =>
        console.error("[applications] Could not delete an orphaned CV after a failed insert."),
      );
      throw error;
    }

    notificationService.sendApplicationReceived(record.email, { fullName: record.fullName, positionLabel });
    const settings = await settingsService.get();
    const staff = settings.recruitmentEmail || settings.contactEmail;
    if (staff) {
      notificationService.sendApplicationAlert(staff, {
        id: record.id,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone,
        positionLabel,
        message: record.message,
        cvFilename: record.cvFilename,
      });
    } else {
      console.warn("[applications] No recruitment or contact email in workspace settings; staff alert not sent.");
    }
    return { status: 201, id: record.id };
  },

  async list(query: ApplicationListQuery) {
    const { items, total } = await jobApplicationRepository.list(query);
    return { items: items.map(toJobApplicationDto), meta: pageMeta(query.page, query.pageSize, total) };
  },

  async get(id: string) {
    return toJobApplicationDto(await getRecord(id));
  },

  async update(id: string, input: ApplicationUpdateInput, actor: Actor) {
    const existing = await getRecord(id);
    const record = await jobApplicationRepository.update(id, { status: input.status });
    if (existing.status !== record.status) {
      await activityService.record(actor, {
        action: "status_changed",
        entityType: "job_application",
        entityId: id,
        summary: `Application for ${record.positionLabel}: ${existing.status} → ${record.status}`,
      });
    }
    return toJobApplicationDto(record);
  },

  /** ADMIN only (enforced by the route). Deletes the CV from Cloudinary first. */
  async remove(id: string, actor: Actor) {
    const existing = await getRecord(id);
    await destroyPrivateRaw(existing.cvPublicId).catch((error: unknown) => {
      console.error("[applications] CV delete failed:", error instanceof Error ? error.message : "unknown error");
      throw new ApiError(502, "INTERNAL_ERROR", "The CV could not be deleted from storage, so the application was kept. Try again.");
    });
    await jobApplicationRepository.delete(id);
    await activityService.record(actor, {
      action: "deleted",
      entityType: "job_application",
      entityId: id,
      summary: `Deleted application for ${existing.positionLabel} and its CV`,
    });
    return { id };
  },

  /** A 10-minute signed link to the CV. Every view is logged. */
  async cvLink(id: string, actor: Actor): Promise<string> {
    const record = await getRecord(id);
    await activityService.record(actor, {
      action: "viewed_cv",
      entityType: "job_application",
      entityId: id,
      summary: `Viewed the CV for an application for ${record.positionLabel}`,
    });
    return privateRawDownloadUrl(record.cvPublicId);
  },

  countNew() {
    return jobApplicationRepository.countByStatus("NEW");
  },

  listPositions() {
    return jobApplicationRepository.listPositions();
  },
};
