"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useState } from "react";

import { describedBy, FieldShell } from "@/components/admin/admin-parts";
import type { FieldConfig } from "@/components/admin/module-configs";
import { AdminApiError, errorMessage } from "@/lib/admin/api-client";
import { uploadToCloudinary } from "@/lib/admin/cloudinary-upload";
import {
  initialValues,
  missingRequired,
  toPayload,
  type AdminRecord,
  type AssetValue,
  type FormValue,
  type FormValues,
} from "@/lib/admin/field-values";
import type { UploadFolder } from "@/lib/domain";
import { cn } from "@/lib/utils";

/*
 * Schema-driven form. Converts values with field-values.ts, submits through
 * the caller, and shows API field errors under the matching field.
 */

export function FieldsForm({
  fields,
  item,
  mode,
  area,
  folder,
  submitLabel,
  onSubmit,
  onCancel,
  readOnly,
  intro,
}: {
  fields: readonly FieldConfig[];
  item?: AdminRecord | null;
  mode: "create" | "update";
  /** data-testid area, e.g. "projects-form". */
  area: string;
  folder: UploadFolder;
  submitLabel: string;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
  intro?: React.ReactNode;
}) {
  const formId = useId();
  const [values, setValues] = useState<FormValues>(() => initialValues(fields, item));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);

  function setValue(name: string, value: FormValue) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const missing = missingRequired(fields, values);
    if (Object.keys(missing).length) {
      setErrors(missing);
      setFormError("Fill in the required fields.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(toPayload(fields, values, mode));
    } catch (error) {
      if (error instanceof AdminApiError) {
        const fieldErrors = error.fieldErrors();
        // Map paired *PublicId errors onto their visible asset field.
        for (const field of fields) {
          if (field.publicIdField && fieldErrors[field.publicIdField] && !fieldErrors[field.name]) {
            fieldErrors[field.name] = fieldErrors[field.publicIdField]!;
          }
        }
        setErrors(fieldErrors);
      }
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-form" onSubmit={submit} noValidate data-testid={`form-${area}`}>
      {intro}
      <fieldset className="adm-form-grid" disabled={readOnly || busy}>
        {fields.map((field) => (
          <Field
            key={field.name}
            id={`${formId}-${field.name}`}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            area={area}
            folder={field.folder ?? folder}
            onChange={(value) => setValue(field.name, value)}
            onUploadingChange={(delta) => setUploading((count) => count + delta)}
          />
        ))}
      </fieldset>
      {formError ? (
        <p className="adm-form-error" role="alert">
          {formError}
        </p>
      ) : null}
      {!readOnly ? (
        <div className="adm-form-actions">
          {onCancel ? (
            <button type="button" className="adm-button adm-button--ghost" onClick={onCancel} data-testid={`button-${area}-cancel`}>
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            className="adm-button adm-button--primary"
            disabled={busy || uploading > 0}
            data-testid={`button-${area}-submit`}
          >
            {busy ? <Loader2 aria-hidden size={16} className="adm-spin" /> : null}
            {uploading > 0 ? "Uploading…" : submitLabel}
          </button>
        </div>
      ) : null}
    </form>
  );
}

function Field({
  id,
  field,
  value,
  error,
  area,
  folder,
  onChange,
  onUploadingChange,
}: {
  id: string;
  field: FieldConfig;
  value: FormValue | undefined;
  error?: string;
  area: string;
  folder: UploadFolder;
  onChange: (value: FormValue) => void;
  onUploadingChange: (delta: number) => void;
}) {
  const aria = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(id, error, field.help),
    "aria-required": field.required || undefined,
    readOnly: field.readOnly,
  };
  const text = typeof value === "string" ? value : "";
  const testName = field.name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

  let control: React.ReactNode;
  switch (field.kind) {
    case "textarea":
    case "lines":
      control = (
        <textarea
          {...aria}
          className="adm-input adm-textarea"
          rows={field.rows ?? 4}
          value={text}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          data-testid={`textarea-${area}-${testName}`}
        />
      );
      break;
    case "select":
      control = (
        <select
          {...aria}
          className="adm-input adm-select"
          disabled={field.readOnly}
          value={text}
          onChange={(event) => onChange(event.target.value)}
          data-testid={`select-${area}-${testName}`}
        >
          {field.emptyLabel !== undefined || !field.required ? <option value="">{field.emptyLabel ?? "None"}</option> : null}
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
      break;
    case "boolean":
      return (
        <div className={cn("adm-field adm-field--check", field.wide && "adm-field--wide")}>
          <label className="adm-check">
            <input
              type="checkbox"
              id={id}
              checked={value === true}
              onChange={(event) => onChange(event.target.checked)}
              data-testid={`checkbox-${area}-${testName}`}
            />
            <span>{field.label}</span>
          </label>
          {field.help ? <p className="adm-field-help">{field.help}</p> : null}
        </div>
      );
    case "asset":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} wide={field.wide}>
          <AssetInput
            id={id}
            value={(value as AssetValue | undefined) ?? { url: "", publicId: "" }}
            folder={folder}
            label={field.label}
            testId={`${area}-${testName}`}
            onChange={onChange}
            onUploadingChange={onUploadingChange}
            describedBy={describedBy(id, error, field.help)}
            previewTone={field.previewTone}
          />
        </FieldShell>
      );
    case "assets":
      return (
        <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} wide={field.wide}>
          <AssetsInput
            id={id}
            value={(value as AssetValue[] | undefined) ?? []}
            folder={folder}
            label={field.label}
            maxItems={field.maxItems ?? 24}
            testId={`${area}-${testName}`}
            onChange={onChange}
            onUploadingChange={onUploadingChange}
          />
        </FieldShell>
      );
    default:
      control = (
        <input
          {...aria}
          className="adm-input"
          type={field.kind === "number" ? "number" : field.kind === "url" ? "url" : "text"}
          inputMode={field.kind === "number" ? "decimal" : undefined}
          min={field.min}
          max={field.max}
          step={field.step}
          value={text}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          data-testid={`input-${area}-${testName}`}
        />
      );
  }

  return (
    <FieldShell id={id} label={field.label} required={field.required} help={field.help} error={error} wide={field.wide}>
      {control}
    </FieldShell>
  );
}

/** One image: preview, upload/replace, remove. */
function AssetInput({
  id,
  value,
  folder,
  label,
  testId,
  onChange,
  onUploadingChange,
  describedBy: describedById,
  previewTone = "light",
}: {
  id: string;
  value: AssetValue;
  folder: UploadFolder;
  label: string;
  testId: string;
  onChange: (value: AssetValue) => void;
  onUploadingChange: (delta: number) => void;
  describedBy?: string;
  previewTone?: "light" | "dark";
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploadError(null);
    setProgress(0);
    onUploadingChange(1);
    try {
      onChange(await uploadToCloudinary(file, { folder, onProgress: setProgress }));
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setProgress(null);
      onUploadingChange(-1);
    }
  }

  return (
    <div className="adm-asset">
      <div className={previewTone === "dark" ? "adm-asset-preview adm-asset-preview--dark" : "adm-asset-preview"}>
        {value.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary upload
          <img src={value.url} alt={`${label} preview`} />
        ) : (
          <span className="adm-asset-placeholder">No image</span>
        )}
      </div>
      <div className="adm-asset-actions">
        <label className="adm-button adm-button--secondary adm-button--sm adm-file-button">
          <ImagePlus aria-hidden size={16} />
          {value.url ? "Replace" : "Upload"}
          <input
            id={id}
            type="file"
            accept="image/*"
            className="adm-visually-hidden"
            aria-describedby={describedById}
            disabled={progress !== null}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload(file);
            }}
            data-testid={`input-${testId}-file`}
          />
        </label>
        {value.url ? (
          <button
            type="button"
            className="adm-button adm-button--ghost adm-button--sm"
            onClick={() => onChange({ url: "", publicId: "" })}
            data-testid={`button-${testId}-remove`}
          >
            <Trash2 aria-hidden size={16} /> Remove
          </button>
        ) : null}
        {progress !== null ? (
          <span className="adm-upload-progress" role="status">
            <Loader2 aria-hidden size={14} className="adm-spin" /> Uploading {progress}%
          </span>
        ) : null}
      </div>
      {uploadError ? (
        <p className="adm-field-error" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

/** Several images (project gallery): add, reorder, remove. */
function AssetsInput({
  id,
  value,
  folder,
  label,
  maxItems,
  testId,
  onChange,
  onUploadingChange,
}: {
  id: string;
  value: AssetValue[];
  folder: UploadFolder;
  label: string;
  maxItems: number;
  testId: string;
  onChange: (value: AssetValue[]) => void;
  onUploadingChange: (delta: number) => void;
}) {
  const [pending, setPending] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(files: File[]) {
    setUploadError(null);
    const room = Math.max(0, maxItems - value.length);
    const batch = files.slice(0, room);
    if (files.length > room) setUploadError(`Only ${maxItems} images are allowed; extra files were skipped.`);
    setPending(batch.length);
    onUploadingChange(1);
    let current = value;
    try {
      for (const file of batch) {
        const asset = await uploadToCloudinary(file, { folder });
        current = [...current, asset];
        onChange(current);
        setPending((count) => count - 1);
      }
    } catch (error) {
      setUploadError(errorMessage(error));
    } finally {
      setPending(0);
      onUploadingChange(-1);
    }
  }

  function move(index: number, delta: number) {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item!);
    onChange(next);
  }

  return (
    <div className="adm-assets">
      {value.length ? (
        <ul className="adm-assets-grid">
          {value.map((asset, index) => (
            <li key={asset.url} className="adm-assets-item">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
              <img src={asset.url} alt={`${label} image ${index + 1}`} />
              <div className="adm-assets-item-actions">
                <button
                  type="button"
                  className="adm-icon-button adm-icon-button--sm"
                  aria-label={`Move image ${index + 1} earlier`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  data-testid={`button-${testId}-earlier-${index}`}
                >
                  <ArrowLeft aria-hidden size={14} />
                </button>
                <button
                  type="button"
                  className="adm-icon-button adm-icon-button--sm"
                  aria-label={`Move image ${index + 1} later`}
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                  data-testid={`button-${testId}-later-${index}`}
                >
                  <ArrowRight aria-hidden size={14} />
                </button>
                <button
                  type="button"
                  className="adm-icon-button adm-icon-button--sm adm-icon-button--danger"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  data-testid={`button-${testId}-remove-${index}`}
                >
                  <Trash2 aria-hidden size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="adm-field-help">No images yet.</p>
      )}
      <div className="adm-asset-actions">
        <label className={cn("adm-button adm-button--secondary adm-button--sm adm-file-button", value.length >= maxItems && "is-disabled")}>
          <ImagePlus aria-hidden size={16} />
          Add images
          <input
            id={id}
            type="file"
            accept="image/*"
            multiple
            className="adm-visually-hidden"
            disabled={pending > 0 || value.length >= maxItems}
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) void upload(files);
            }}
            data-testid={`input-${testId}-files`}
          />
        </label>
        <span className="adm-field-help">
          {value.length} / {maxItems}
        </span>
        {pending > 0 ? (
          <span className="adm-upload-progress" role="status">
            <Loader2 aria-hidden size={14} className="adm-spin" /> Uploading {pending} {pending === 1 ? "image" : "images"}…
          </span>
        ) : null}
      </div>
      {uploadError ? (
        <p className="adm-field-error" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}
