import { describe, expect, it } from "vitest";
import {
  normalizeJobTitleName,
  shouldOfferCreateJobTitle,
  toJobTitleOption,
} from "./job-title-picker";

const options = [
  { label: "Software Engineer", value: "1" },
  { label: "Product Manager", value: "2" },
];

describe("normalizeJobTitleName", () => {
  it("trims leading and trailing whitespace", () => {
    expect(normalizeJobTitleName("  Platform Engineer  ")).toBe("Platform Engineer");
  });

  it("treats blank titles as empty", () => {
    expect(normalizeJobTitleName("   ")).toBe("");
  });
});

describe("shouldOfferCreateJobTitle", () => {
  it("does not offer create when the search is blank", () => {
    expect(shouldOfferCreateJobTitle("   ", options)).toBe(false);
  });

  it("does not offer create when existing titles match", () => {
    expect(shouldOfferCreateJobTitle("engineer", options)).toBe(false);
    expect(shouldOfferCreateJobTitle("Software Engineer", options)).toBe(false);
  });

  it("offers create when no existing title matches", () => {
    expect(shouldOfferCreateJobTitle("Platform Engineer", options)).toBe(true);
  });
});

describe("toJobTitleOption", () => {
  it("maps the persisted id for later role creation", () => {
    expect(toJobTitleOption({ id: 123, name: "Platform Engineer" })).toEqual({
      label: "Platform Engineer",
      value: "123",
    });
  });
});
