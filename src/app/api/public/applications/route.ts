import { ApiError } from "@/lib/api/api-error";
import { getClientIp } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { jobApplicationService } from "@/Services/job-application.service";

/** The CV limit is 5 MB; allow some room for the other fields and multipart framing. */
const MAX_BODY_BYTES = 6 * 1024 * 1024;

/**
 * Job application (multipart/form-data): fields from the shared schema plus
 * a "cv" file. 201 { id } when stored; 202 for a filled honeypot (nothing
 * stored); 422 with field errors; 409 for a repeat within 24 hours; 429 when
 * rate limited.
 */
export async function POST(request: Request) {
  return handle(async () => {
    const length = Number(request.headers.get("content-length") ?? "0");
    if (length > MAX_BODY_BYTES) {
      throw new ApiError(413, "VALIDATION_ERROR", "Your CV is too large.", {
        details: { cv: "The maximum size is 5 MB" },
      });
    }
    if (!(request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      throw ApiError.badRequest("Send the application as multipart/form-data.");
    }
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw ApiError.badRequest("The application could not be read. Please try again.");
    }
    const result = await jobApplicationService.submit(form, getClientIp(request));
    return result.status === 201 ? ok({ id: result.id }, { status: 201 }) : ok({ received: true }, { status: 202 });
  });
}
