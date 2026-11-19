import { z } from "zod";

const postgresUrl = z
  .string()
  .trim()
  .url("must be a valid URL")
  .refine((value) => /^postgres(ql)?:\/\//.test(value), {
    message: "must start with postgres:// or postgresql://",
  });

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    // Database
    DATABASE_URL: postgresUrl,
    DIRECT_URL: postgresUrl,
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).optional(),

    // Auth
    SESSION_SECRET: z
      .string()
      .min(32, "must be at least 32 characters (generate with: openssl rand -base64 48)"),

    // Public base URL used in email links
    APP_URL: z
      .string()
      .trim()
      .url("must be a full URL, e.g. https://gloveslyproject.com")
      .transform((value) => value.replace(/\/+$/, "")),

    // Cloudinary (signed direct uploads)
    CLOUDINARY_CLOUD_NAME: z
      .string()
      .trim()
      .regex(/^[a-z0-9_-]+$/i, "must contain only letters, digits, '-' or '_'"),
    CLOUDINARY_API_KEY: z.string().trim().regex(/^\d+$/, "must be numeric"),
    CLOUDINARY_API_SECRET: z.string().trim().min(1, "is required"),

    // Email over SMTP (optional: without SMTP_HOST, emails are logged in dev, skipped in prod)
    SMTP_HOST: optionalString,
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_SECURE: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => value === "true"),
    SMTP_USER: optionalString,
    SMTP_PASS: optionalString,
    EMAIL_FROM: optionalString,
  })
  .superRefine((env, ctx) => {
    if (env.SMTP_HOST && !env.EMAIL_FROM) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["EMAIL_FROM"],
        message: "is required when SMTP_HOST is set",
      });
    }
    if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [env.SMTP_USER ? "SMTP_PASS" : "SMTP_USER"],
        message: "SMTP_USER and SMTP_PASS must be set together",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Validated server environment. Throws once with every problem listed. */
export function getEnv(): Env {
  if (cached) return cached;

  // Treat `KEY=` (empty, as in .env.example) as unset, so optional variables
  // stay optional and required ones report "is required".
  const raw = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== undefined && value.trim() !== ""),
  );
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${problems}\nSee .env.example.`);
  }

  cached = result.data;
  return cached;
}
