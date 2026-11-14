import { describe, expect, it } from "vitest";
import { buildCreateBlueprintPayload, requiresJobTitles } from "./blueprint-create";

const applications = [{ applicationId: 10, roles: ["User"] }];

describe("requiresJobTitles", () => {
  it("keeps job titles mandatory for global blueprints only", () => {
    expect(requiresJobTitles("global")).toBe(true);
    expect(requiresJobTitles("company")).toBe(false);
  });
});

describe("buildCreateBlueprintPayload", () => {
  it("includes job titles for global blueprints and omits company", () => {
    expect(
      buildCreateBlueprintPayload({
        name: "Employee Onboarding",
        blueprintType: "global",
        jobTitleIds: [3, 8],
        applications,
      })
    ).toEqual({
      name: "Employee Onboarding",
      jobTitleIds: [3, 8],
      applications,
    });
  });

  it("keeps company id and prefix-ready name without sending job titles", () => {
    expect(
      buildCreateBlueprintPayload({
        name: "Employee Onboarding",
        blueprintType: "company",
        companyId: "5",
        jobTitleIds: [3],
        applications,
      })
    ).toEqual({
      name: "Employee Onboarding",
      companyId: 5,
      applications,
    });
  });
});
