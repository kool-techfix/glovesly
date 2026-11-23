import type { FieldConfig } from "@/components/admin/module-configs";
import { toLagosDateInput } from "@/lib/lagos-date";

/*
 * DTO ⇄ form conversion for FieldsForm.
 * - list (comma-separated) and lines (one per line) become string[]
 * - number: empty → null
 * - select: empty → null (omitted on create so the API reports "required")
 * - asset: { url, publicId } → two fields (name + publicIdField)
 * - assets: [{ url, publicId }] → two parallel arrays
 * - slug: empty → omitted (the API generates one)
 * - date: ISO ↔ "YYYY-MM-DD" (Africa/Lagos); empty → null
 */

export type AssetValue = { url: string; publicId: string };
export type FormValue = string | boolean | AssetValue | AssetValue[];
export type FormValues = Record<string, FormValue>;
export type AdminRecord = Record<string, unknown>;

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(asString) : [];
}

export function initialValues(fields: readonly FieldConfig[], item?: AdminRecord | null): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    const raw = item?.[field.name] ?? field.defaultValue;
    switch (field.kind) {
      case "boolean":
        values[field.name] = Boolean(raw);
        break;
      case "list":
        values[field.name] = asStringArray(raw).join(", ");
        break;
      case "lines":
        values[field.name] = asStringArray(raw).join("\n");
        break;
      case "date":
        values[field.name] = toLagosDateInput(typeof raw === "string" ? raw : null);
        break;
      case "asset":
        values[field.name] = {
          url: asString(raw),
          publicId: field.publicIdField ? asString(item?.[field.publicIdField]) : "",
        };
        break;
      case "assets": {
        const urls = asStringArray(raw);
        const ids = field.publicIdField ? asStringArray(item?.[field.publicIdField]) : [];
        values[field.name] = urls.map((url, index) => ({ url, publicId: ids[index] ?? "" }));
        break;
      }
      default:
        values[field.name] = asString(raw);
    }
  }
  return values;
}

function splitList(value: string, separator: RegExp): string[] {
  return value
    .split(separator)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function toPayload(
  fields: readonly FieldConfig[],
  values: FormValues,
  mode: "create" | "update",
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.readOnly) continue;
    const value = values[field.name];
    switch (field.kind) {
      case "boolean":
        payload[field.name] = Boolean(value);
        break;
      case "number": {
        const text = String(value ?? "").trim();
        const parsed = Number(text);
        payload[field.name] = text === "" ? null : Number.isFinite(parsed) ? parsed : text;
        break;
      }
      case "select": {
        const text = String(value ?? "");
        if (text) payload[field.name] = text;
        else if (mode === "update") payload[field.name] = null;
        break;
      }
      case "list":
        payload[field.name] = splitList(String(value ?? ""), /,/);
        break;
      case "lines":
        payload[field.name] = splitList(String(value ?? ""), /\r?\n/);
        break;
      case "slug": {
        const text = String(value ?? "").trim();
        if (text) payload[field.name] = text;
        break;
      }
      case "date": {
        const text = String(value ?? "").trim();
        payload[field.name] = text === "" ? null : text;
        break;
      }
      case "asset": {
        const asset = value as AssetValue | undefined;
        payload[field.name] = asset?.url || null;
        if (field.publicIdField) payload[field.publicIdField] = asset?.url ? asset.publicId || null : null;
        break;
      }
      case "assets": {
        const assets = (value as AssetValue[] | undefined) ?? [];
        payload[field.name] = assets.map((asset) => asset.url);
        if (field.publicIdField) payload[field.publicIdField] = assets.map((asset) => asset.publicId).filter(Boolean);
        break;
      }
      default:
        payload[field.name] = String(value ?? "").trim();
    }
  }
  return payload;
}

/** Client-side "required" check so obvious gaps are caught before a round trip. */
export function missingRequired(fields: readonly FieldConfig[], values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!field.required || field.readOnly) continue;
    const value = values[field.name];
    const empty =
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && !Array.isArray(value) && !value.url);
    if (empty) errors[field.name] = `${field.label} is required`;
  }
  return errors;
}
