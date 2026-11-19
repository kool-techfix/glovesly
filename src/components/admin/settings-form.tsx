"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Notice, PageHeading } from "@/components/admin/admin-parts";
import { useAdmin } from "@/lib/admin/admin-store";
import { AdminApiError, api, errorMessage } from "@/lib/admin/api-client";
import { formatDateTime } from "@/lib/admin/format";
import { NIGERIA_STATES } from "@/lib/nigeria-states";
import type { WorkspaceSettingsDto } from "@/Services/settings.service";

type OfficeRow = { key: string; name: string; state: string; latitude: string; longitude: string; isHeadOffice: boolean };
type StatRow = { key: string; label: string; value: string };

let rowCounter = 0;
const rowKey = () => `row-${++rowCounter}`;

function toNumber(value: string) {
  const text = value.trim();
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : text;
}

export function SettingsForm() {
  const { workspace, setWorkspace, isAdmin } = useAdmin();
  const readOnly = !isAdmin;
  const [contactEmail, setContactEmail] = useState(workspace.contactEmail ?? "");
  const [phone, setPhone] = useState(workspace.phone ?? "");
  const [address, setAddress] = useState(workspace.address ?? "");
  const [offices, setOffices] = useState<OfficeRow[]>(() =>
    workspace.officeLocations.map((office) => ({
      key: rowKey(),
      name: office.name,
      state: office.state,
      latitude: office.latitude === null ? "" : String(office.latitude),
      longitude: office.longitude === null ? "" : String(office.longitude),
      isHeadOffice: office.isHeadOffice,
    })),
  );
  const [stats, setStats] = useState<StatRow[]>(() => workspace.stats.map((stat) => ({ key: rowKey(), ...stat })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function updateOffice(key: string, patch: Partial<OfficeRow>) {
    setOffices((rows) =>
      rows.map((row) => {
        if (row.key === key) return { ...row, ...patch };
        // Only one head office.
        return patch.isHeadOffice ? { ...row, isHeadOffice: false } : row;
      }),
    );
  }

  function updateStat(key: string, patch: Partial<StatRow>) {
    setStats((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      const updated = await api<WorkspaceSettingsDto>("/api/admin/settings", {
        method: "PATCH",
        body: {
          contactEmail: contactEmail.trim(),
          phone,
          address,
          officeLocations: offices.map((office) => ({
            name: office.name,
            state: office.state,
            latitude: toNumber(office.latitude),
            longitude: toNumber(office.longitude),
            isHeadOffice: office.isHeadOffice,
          })),
          stats: stats.map(({ label, value }) => ({ label, value })),
        },
      });
      setWorkspace(updated);
      toast.success("Settings saved.");
    } catch (error) {
      if (error instanceof AdminApiError && error.details) {
        setErrors(Object.fromEntries(Object.entries(error.details).map(([k, v]) => [k, Array.isArray(v) ? v.join(" ") : v])));
      }
      setFormError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const err = (path: string) => errors[path];
  const listError = (name: string) => errors[name];

  return (
    <div className="adm-screen">
      <PageHeading
        title="Settings"
        description={`Contact details, offices and the figures beside the Nigeria map.${workspace.updatedAt ? ` Last saved ${formatDateTime(workspace.updatedAt)}.` : ""}`}
      />
      {readOnly ? (
        <Notice tone="info" testId="notice-settings-read-only">
          Only administrators can change these settings.
        </Notice>
      ) : null}

      <form className="adm-form" onSubmit={submit} noValidate data-testid="form-settings">
        <fieldset className="adm-fieldset-plain" disabled={readOnly || busy}>
          <section className="adm-card adm-settings-section" aria-labelledby="settings-contact">
            <h2 id="settings-contact" className="adm-section-title">
              Contact details
            </h2>
            <div className="adm-form-grid">
              <div className="adm-field">
                <label htmlFor="settings-email" className="adm-label">
                  Contact email
                </label>
                <input
                  id="settings-email"
                  type="email"
                  className="adm-input"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  aria-describedby={err("contactEmail") ? "settings-email-error" : "settings-email-help"}
                  aria-invalid={err("contactEmail") ? true : undefined}
                  data-testid="input-settings-contact-email"
                />
                {err("contactEmail") ? (
                  <p id="settings-email-error" className="adm-field-error">
                    {err("contactEmail")}
                  </p>
                ) : (
                  <p id="settings-email-help" className="adm-field-help">
                    Shown on the site. Contact form alerts are sent here.
                  </p>
                )}
              </div>
              <div className="adm-field">
                <label htmlFor="settings-phone" className="adm-label">
                  Phone
                </label>
                <input
                  id="settings-phone"
                  type="tel"
                  className="adm-input"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  data-testid="input-settings-phone"
                />
                {err("phone") ? <p className="adm-field-error">{err("phone")}</p> : null}
              </div>
              <div className="adm-field adm-field--wide">
                <label htmlFor="settings-address" className="adm-label">
                  Address
                </label>
                <textarea
                  id="settings-address"
                  className="adm-input adm-textarea"
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  data-testid="textarea-settings-address"
                />
                {err("address") ? <p className="adm-field-error">{err("address")}</p> : null}
              </div>
            </div>
          </section>

          <section className="adm-card adm-settings-section" aria-labelledby="settings-offices">
            <h2 id="settings-offices" className="adm-section-title">
              Office locations
            </h2>
            <p className="adm-field-help">Shown on the Nigeria map. Coordinates are optional; set both or neither.</p>
            {listError("officeLocations") ? <p className="adm-field-error">{listError("officeLocations")}</p> : null}
            <ul className="adm-repeater">
              {offices.map((office, index) => (
                <li key={office.key} className="adm-repeater-row adm-repeater-row--office">
                  <div className="adm-field">
                    <label htmlFor={`${office.key}-name`} className="adm-label">
                      Office name
                    </label>
                    <input
                      id={`${office.key}-name`}
                      className="adm-input"
                      value={office.name}
                      onChange={(event) => updateOffice(office.key, { name: event.target.value })}
                      data-testid={`input-settings-office-name-${index}`}
                    />
                    {err(`officeLocations.${index}.name`) ? <p className="adm-field-error">{err(`officeLocations.${index}.name`)}</p> : null}
                  </div>
                  <div className="adm-field">
                    <label htmlFor={`${office.key}-state`} className="adm-label">
                      State
                    </label>
                    <select
                      id={`${office.key}-state`}
                      className="adm-input adm-select"
                      value={office.state}
                      onChange={(event) => updateOffice(office.key, { state: event.target.value })}
                      data-testid={`select-settings-office-state-${index}`}
                    >
                      <option value="">Choose a state</option>
                      {NIGERIA_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {err(`officeLocations.${index}.state`) ? <p className="adm-field-error">{err(`officeLocations.${index}.state`)}</p> : null}
                  </div>
                  <div className="adm-field">
                    <label htmlFor={`${office.key}-lat`} className="adm-label">
                      Latitude
                    </label>
                    <input
                      id={`${office.key}-lat`}
                      className="adm-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={office.latitude}
                      onChange={(event) => updateOffice(office.key, { latitude: event.target.value })}
                      data-testid={`input-settings-office-latitude-${index}`}
                    />
                    {err(`officeLocations.${index}.latitude`) ? <p className="adm-field-error">{err(`officeLocations.${index}.latitude`)}</p> : null}
                  </div>
                  <div className="adm-field">
                    <label htmlFor={`${office.key}-lng`} className="adm-label">
                      Longitude
                    </label>
                    <input
                      id={`${office.key}-lng`}
                      className="adm-input"
                      type="number"
                      step="any"
                      inputMode="decimal"
                      value={office.longitude}
                      onChange={(event) => updateOffice(office.key, { longitude: event.target.value })}
                      data-testid={`input-settings-office-longitude-${index}`}
                    />
                    {err(`officeLocations.${index}.longitude`) ? <p className="adm-field-error">{err(`officeLocations.${index}.longitude`)}</p> : null}
                  </div>
                  <div className="adm-repeater-tail">
                    <label className="adm-check">
                      <input
                        type="checkbox"
                        checked={office.isHeadOffice}
                        onChange={(event) => updateOffice(office.key, { isHeadOffice: event.target.checked })}
                        data-testid={`checkbox-settings-office-head-${index}`}
                      />
                      <span>Head office</span>
                    </label>
                    <button
                      type="button"
                      className="adm-icon-button adm-icon-button--danger"
                      aria-label={`Remove office ${office.name || index + 1}`}
                      onClick={() => setOffices((rows) => rows.filter((row) => row.key !== office.key))}
                      data-testid={`button-settings-office-remove-${index}`}
                    >
                      <Trash2 aria-hidden size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="adm-button adm-button--secondary adm-button--sm"
              disabled={offices.length >= 20}
              onClick={() =>
                setOffices((rows) => [...rows, { key: rowKey(), name: "", state: "", latitude: "", longitude: "", isHeadOffice: rows.length === 0 }])
              }
              data-testid="button-settings-office-add"
            >
              <Plus aria-hidden size={16} /> Add office
            </button>
          </section>

          <section className="adm-card adm-settings-section" aria-labelledby="settings-stats">
            <h2 id="settings-stats" className="adm-section-title">
              Map stats
            </h2>
            <p className="adm-field-help">Up to 8 short figures shown beside the map, e.g. a value of &ldquo;120+&rdquo;.</p>
            {listError("stats") ? <p className="adm-field-error">{listError("stats")}</p> : null}
            <ul className="adm-repeater">
              {stats.map((stat, index) => (
                <li key={stat.key} className="adm-repeater-row adm-repeater-row--stat">
                  <div className="adm-field">
                    <label htmlFor={`${stat.key}-value`} className="adm-label">
                      Value
                    </label>
                    <input
                      id={`${stat.key}-value`}
                      className="adm-input"
                      value={stat.value}
                      onChange={(event) => updateStat(stat.key, { value: event.target.value })}
                      data-testid={`input-settings-stat-value-${index}`}
                    />
                    {err(`stats.${index}.value`) ? <p className="adm-field-error">{err(`stats.${index}.value`)}</p> : null}
                  </div>
                  <div className="adm-field">
                    <label htmlFor={`${stat.key}-label`} className="adm-label">
                      Label
                    </label>
                    <input
                      id={`${stat.key}-label`}
                      className="adm-input"
                      value={stat.label}
                      onChange={(event) => updateStat(stat.key, { label: event.target.value })}
                      data-testid={`input-settings-stat-label-${index}`}
                    />
                    {err(`stats.${index}.label`) ? <p className="adm-field-error">{err(`stats.${index}.label`)}</p> : null}
                  </div>
                  <div className="adm-repeater-tail">
                    <button
                      type="button"
                      className="adm-icon-button adm-icon-button--danger"
                      aria-label={`Remove stat ${stat.label || index + 1}`}
                      onClick={() => setStats((rows) => rows.filter((row) => row.key !== stat.key))}
                      data-testid={`button-settings-stat-remove-${index}`}
                    >
                      <Trash2 aria-hidden size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="adm-button adm-button--secondary adm-button--sm"
              disabled={stats.length >= 8}
              onClick={() => setStats((rows) => [...rows, { key: rowKey(), label: "", value: "" }])}
              data-testid="button-settings-stat-add"
            >
              <Plus aria-hidden size={16} /> Add stat
            </button>
          </section>
        </fieldset>

        {formError ? (
          <p className="adm-form-error" role="alert">
            {formError}
          </p>
        ) : null}
        {!readOnly ? (
          <div className="adm-form-actions adm-form-actions--start">
            <button type="submit" className="adm-button adm-button--primary" disabled={busy} data-testid="button-settings-save">
              {busy ? <Loader2 aria-hidden size={16} className="adm-spin" /> : null}
              Save settings
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
