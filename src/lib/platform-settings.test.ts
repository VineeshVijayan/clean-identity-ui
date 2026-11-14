import { describe, expect, it } from "vitest";
import {
  appearanceButtonColorsJson,
  listingPageSize,
  parseButtonColors,
  parseSidebarIcons,
  postLoginPath,
  SETTING_KEYS,
  setPendingButtonColor,
  setPendingButtonColors,
  settingString,
  splitBrandName,
} from "./platform-settings";

describe("listingPageSize", () => {
  it("uses the saved page size and clamps to allowed bounds", () => {
    expect(listingPageSize({ [SETTING_KEYS.listingPageSize]: 50 })).toBe(50);
    expect(listingPageSize({ [SETTING_KEYS.listingPageSize]: "8" })).toBe(8);
    expect(listingPageSize({ [SETTING_KEYS.listingPageSize]: 1 })).toBe(5);
    expect(listingPageSize({ [SETTING_KEYS.listingPageSize]: 400 })).toBe(100);
    expect(listingPageSize({})).toBe(20);
  });
});

describe("postLoginPath", () => {
  it("keeps end users on the welcome page", () => {
    expect(postLoginPath({ [SETTING_KEYS.defaultLandingPage]: "dashboard" }, { endUser: true })).toBe(
      "/welcome"
    );
  });

  it("honors the administrator landing page", () => {
    expect(postLoginPath({ [SETTING_KEYS.defaultLandingPage]: "welcome" }, { endUser: false })).toBe(
      "/welcome"
    );
    expect(postLoginPath({}, { endUser: false })).toBe("/dashboard");
  });
});

describe("splitBrandName", () => {
  it("keeps the Identity Framework accent split", () => {
    expect(splitBrandName("Identity Framework")).toEqual({ lead: "Identity", accent: "Framework" });
    expect(splitBrandName("Acme")).toEqual({ lead: "Acme", accent: "" });
  });
});

describe("settingString", () => {
  it("returns fallbacks for missing values", () => {
    expect(settingString({}, SETTING_KEYS.displayName, "Identity Framework")).toBe(
      "Identity Framework"
    );
    expect(settingString({ [SETTING_KEYS.displayName]: "Acme ID" }, SETTING_KEYS.displayName)).toBe(
      "Acme ID"
    );
  });
});

describe("parseSidebarIcons", () => {
  it("reads saved icon names from a JSON setting", () => {
    expect(
      parseSidebarIcons({
        [SETTING_KEYS.sidebarIcons]: JSON.stringify({ dashboard: "Users", reports: "Heart" }),
      })
    ).toEqual({ dashboard: "Users", reports: "Heart" });
  });
});

describe("parseButtonColors", () => {
  it("reads saved button colors from a JSON setting", () => {
    expect(
      parseButtonColors({
        [SETTING_KEYS.buttonColors]: JSON.stringify({
          btn1: { bgColor: "#123456", borderColor: "#654321", borderRadius: [12] },
        }),
      })
    ).toEqual({
      btn1: { bgColor: "#123456", borderColor: "#654321", borderRadius: [12] },
    });
  });

  it("includes unsaved button color edits in the save payload", () => {
    setPendingButtonColors(null);
    setPendingButtonColor("btn2", { bgColor: "#005d90", borderColor: "#005d90", borderRadius: [8] });
    expect(
      JSON.parse(
        appearanceButtonColorsJson({
          [SETTING_KEYS.buttonColors]: JSON.stringify({
            btn1: { bgColor: "#123456", borderColor: "#654321", borderRadius: [12] },
          }),
        })
      )
    ).toEqual({
      btn1: { bgColor: "#123456", borderColor: "#654321", borderRadius: [12] },
      btn2: { bgColor: "#005d90", borderColor: "#005d90", borderRadius: [8] },
    });
    setPendingButtonColors(null);
  });
});
