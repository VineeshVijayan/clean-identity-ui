import { describe, expect, it } from "vitest";
import {
  composeBlueprintName,
  deriveCompanyPrefix,
  isEnabledCompany,
  resolveCompanyPrefix,
  stripRepeatedPrefix,
} from "./company-prefix";

describe("deriveCompanyPrefix", () => {
  it("uses the first significant word as a readable company code", () => {
    expect(deriveCompanyPrefix("ABC Technologies")).toBe("ABC");
    expect(deriveCompanyPrefix("Acme Solutions")).toBe("ACME");
    expect(deriveCompanyPrefix("Ndash Private Limited")).toBe("NDASH");
  });

  it("is deterministic for the same company name", () => {
    expect(deriveCompanyPrefix("Acme Solutions")).toBe(deriveCompanyPrefix("Acme Solutions"));
  });
});

describe("stripRepeatedPrefix", () => {
  it("removes a duplicated generated prefix from the user-entered name", () => {
    expect(stripRepeatedPrefix("ABC-Employee Onboarding", "ABC")).toBe("Employee Onboarding");
    expect(stripRepeatedPrefix("ABC-ABC-Employee Onboarding", "ABC")).toBe("Employee Onboarding");
  });
});

describe("composeBlueprintName", () => {
  it("prepends the company prefix before save", () => {
    expect(composeBlueprintName("ABC", "Employee Onboarding")).toBe("ABC-Employee Onboarding");
  });
});

describe("resolveCompanyPrefix", () => {
  it("prefers a persisted company code over a derived one", () => {
    expect(resolveCompanyPrefix({ name: "Acme Solutions", code: "ACME2" })).toBe("ACME2");
    expect(resolveCompanyPrefix({ name: "Acme Solutions" })).toBe("ACME");
  });
});

describe("isEnabledCompany", () => {
  it("excludes disabled companies from the blueprint company dropdown", () => {
    expect(isEnabledCompany({ enabled: true })).toBe(true);
    expect(isEnabledCompany({ enabled: false })).toBe(false);
    expect(isEnabledCompany({ isEnabled: false })).toBe(false);
  });
});
