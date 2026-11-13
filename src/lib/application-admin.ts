import type { ApplicationConfigField, ApplicationDto } from "@/services/application-api";

export const SECRET_PLACEHOLDER = "********";

export function splitConfigurationValues(
  schema: ApplicationConfigField[],
  values: Record<string, string>
): { configuration: Record<string, string>; secrets: Record<string, string> } {
  const configuration: Record<string, string> = {};
  const secrets: Record<string, string> = {};
  for (const field of schema) {
    const value = values[field.key];
    if (value == null || value === "") continue;
    if (field.sensitive) {
      if (value === SECRET_PLACEHOLDER) continue;
      secrets[field.key] = value;
    } else {
      configuration[field.key] = value;
    }
  }
  return { configuration, secrets };
}

export function initialConfigValues(
  schema: ApplicationConfigField[],
  stored: Record<string, string> = {},
  secretsConfigured: Record<string, boolean> = {}
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const field of schema) {
    if (field.sensitive) {
      next[field.key] = secretsConfigured[field.key] ? "" : "";
    } else {
      next[field.key] = stored[field.key] ?? field.defaultValue ?? "";
    }
  }
  return next;
}

export function configurationStatusLabel(app: ApplicationDto): "Configured" | "Not Configured" {
  return app.configured ? "Configured" : "Not Configured";
}

export function formatTimestamp(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}
