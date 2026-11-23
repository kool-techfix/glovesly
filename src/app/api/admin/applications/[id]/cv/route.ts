import { NextResponse } from "next/server";

import { parseParams } from "@/lib/api/request";
import { handle } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { idParamsSchema } from "@/Schemas/common.schema";
import { jobApplicationService } from "@/Services/job-application.service";

type Context = { params: Promise<{ id: string }> };

/** Redirects to a 10-minute signed download link for the CV. Logged. Never cached. */
export async function GET(_request: Request, context: Context) {
  return handle(async () => {
    const actor = await requireEditor();
    const { id } = parseParams(await context.params, idParamsSchema);
    const url = await jobApplicationService.cvLink(id, actor);
    return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  });
}
