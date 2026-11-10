const SKIP_TOKENS = new Set([
  "THE",
  "AND",
  "PRIVATE",
  "LIMITED",
  "LTD",
  "INC",
  "LLC",
  "CORP",
  "CORPORATION",
  "PVT",
  "CO",
  "COMPANY",
  "PLC",
]);

const MAX_BASE_LENGTH = 12;
const FALLBACK_LENGTH = 8;
const DEFAULT_CODE = "CO";

export type CompanyPrefixSource = {
  code?: string | null;
  name: string;
};

export function deriveCompanyPrefix(companyName: string): string {
  if (!companyName?.trim()) {
    return DEFAULT_CODE;
  }

  const tokens = companyName.trim().split(/[^A-Za-z0-9]+/);
  for (const token of tokens) {
    if (!token) continue;
    const upper = token.toUpperCase();
    if (SKIP_TOKENS.has(upper)) continue;
    const alnum = upper.replace(/[^A-Z0-9]/g, "");
    if (!alnum) continue;
    return alnum.length > MAX_BASE_LENGTH ? alnum.slice(0, MAX_BASE_LENGTH) : alnum;
  }

  const compact = companyName.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!compact) return DEFAULT_CODE;
  return compact.length > FALLBACK_LENGTH ? compact.slice(0, FALLBACK_LENGTH) : compact;
}

export function stripRepeatedPrefix(name: string, prefix: string): string {
  if (!name) return "";
  let remaining = name.trim();
  if (!prefix) return remaining;
  const marker = `${prefix}-`;
  while (
    remaining.length > marker.length &&
    remaining.toUpperCase().startsWith(marker.toUpperCase())
  ) {
    remaining = remaining.slice(marker.length).trim();
  }
  if (remaining.toUpperCase() === prefix.toUpperCase()) {
    return "";
  }
  return remaining;
}

export function composeBlueprintName(prefix: string, userEnteredName: string): string {
  return `${prefix}-${userEnteredName.trim()}`;
}

export function resolveCompanyPrefix(company: CompanyPrefixSource): string {
  const persisted = company.code?.trim();
  if (persisted) {
    return persisted.toUpperCase();
  }
  return deriveCompanyPrefix(company.name);
}

export function isEnabledCompany(company: { enabled?: boolean; isEnabled?: boolean }): boolean {
  return (company.enabled ?? company.isEnabled) === true;
}
