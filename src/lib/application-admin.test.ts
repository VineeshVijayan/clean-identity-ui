import { describe, expect, it } from "vitest";
import { isEssentialApplication } from "@/services/application-api";
import {
  SECRET_PLACEHOLDER,
  configurationStatusLabel,
  splitConfigurationValues,
} from "./application-admin";

describe("splitConfigurationValues", () => {
  const schema = [
    { key: "baseUrl", label: "URL", sensitive: false },
    { key: "apiToken", label: "Token", sensitive: true, required: true },
  ];

  it("keeps non-sensitive values and omits unchanged secret placeholders", () => {
    expect(
      splitConfigurationValues(schema, {
        baseUrl: "https://example.atlassian.net",
        apiToken: SECRET_PLACEHOLDER,
      })
    ).toEqual({
      configuration: { baseUrl: "https://example.atlassian.net" },
      secrets: {},
    });
  });

  it("sends a replacement secret without exposing the previous value", () => {
    expect(
      splitConfigurationValues(schema, {
        baseUrl: "https://example.atlassian.net",
        apiToken: "new-token",
      })
    ).toEqual({
      configuration: { baseUrl: "https://example.atlassian.net" },
      secrets: { apiToken: "new-token" },
    });
  });
});

describe("isEssentialApplication", () => {
  it("reads the essential flag dynamically and does not hardcode app names", () => {
    expect(isEssentialApplication({ essential: true })).toBe(true);
    expect(isEssentialApplication({ essential: false })).toBe(false);
    expect(isEssentialApplication({ essential: null })).toBe(false);
  });
});

describe("configurationStatusLabel", () => {
  it("labels configuration from the backend flag", () => {
    expect(configurationStatusLabel({ id: 1, name: "Jira", description: null, appUrl: null, integrationName: "jira", active: true, configured: true })).toBe("Configured");
    expect(configurationStatusLabel({ id: 1, name: "Jira", description: null, appUrl: null, integrationName: "jira", active: true, configured: false })).toBe("Not Configured");
  });
});
