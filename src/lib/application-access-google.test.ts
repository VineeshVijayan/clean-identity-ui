import { describe, expect, it } from "vitest";
import {
  buildGoogleResourceKey,
  describeGoogleProjectsError,
  filterRolesForResource,
  fromSelectSafeValue,
  googleResourceIdFromKey,
  googleResourceTypeFromKey,
  toSelectSafeValue,
} from "./application-access";

const googleRoles = [
  { id: "GROUP:MEMBER", name: "Group Member" },
  { id: "GROUP:OWNER", name: "Group Owner" },
  { id: "SHARED_DRIVE:reader", name: "Shared Drive Reader" },
  { id: "CALENDAR:writer", name: "Calendar Writer" },
];

describe("Google Workspace select values", () => {
  it("encodes colons so Radix Select can render items", () => {
    expect(toSelectSafeValue("GROUP:MEMBER")).toBe("GROUP%3AMEMBER");
    expect(fromSelectSafeValue("GROUP%3AMEMBER")).toBe("GROUP:MEMBER");
    expect(fromSelectSafeValue(toSelectSafeValue("GROUP:team@example.com"))).toBe(
      "GROUP:team@example.com"
    );
  });

  it("filters roles to the selected Google resource type", () => {
    expect(googleResourceTypeFromKey("GROUP:team@example.com")).toBe("GROUP");
    expect(
      filterRolesForResource(googleRoles, "google", "GROUP:team@example.com").map((role) => role.id)
    ).toEqual(["GROUP:MEMBER", "GROUP:OWNER"]);
    expect(filterRolesForResource(googleRoles, "google", "GROUP:").map((role) => role.id)).toEqual([
      "GROUP:MEMBER",
      "GROUP:OWNER",
    ]);
    expect(filterRolesForResource(googleRoles, "google", "")).toEqual([]);
    expect(filterRolesForResource(googleRoles, "jira", "ABC")).toEqual(googleRoles);
  });

  it("builds and parses Google resource keys for manual entry", () => {
    expect(buildGoogleResourceKey("GROUP", " team@example.com ")).toBe("GROUP:team@example.com");
    expect(buildGoogleResourceKey("CALENDAR", "")).toBe("CALENDAR:");
    expect(googleResourceTypeFromKey("GROUP")).toBe("GROUP");
    expect(googleResourceIdFromKey("GROUP:team@example.com")).toBe("team@example.com");
  });

  it("shortens the Hub not-configured projects error", () => {
    expect(
      describeGoogleProjectsError(
        "Failed to load Google Workspace resources: groups: Google Workspace is not configured: integrations.google.service-account-email is required"
      )
    ).toBe(
      "Google Workspace is not connected. Enter a group, shared drive, calendar, or org unit to continue."
    );
  });
});
