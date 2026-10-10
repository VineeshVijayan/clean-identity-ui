import { beforeEach, describe, expect, it, vi } from "vitest";

const identityFetch = vi.fn();

vi.mock("@/services/api-config", () => ({
  identityFetch: (...args: unknown[]) => identityFetch(...args),
}));

import { createJobTitle } from "./job-title-api";

describe("createJobTitle", () => {
  beforeEach(() => {
    identityFetch.mockReset();
  });

  it("does not call the API for blank titles", async () => {
    await expect(createJobTitle("   ")).rejects.toThrow("Job title is required");
    expect(identityFetch).not.toHaveBeenCalled();
  });

  it("posts the trimmed name and returns the persisted title", async () => {
    identityFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { id: 123, name: "Platform Engineer", source: "IDF" },
      }),
    });

    await expect(createJobTitle("  Platform Engineer  ")).resolves.toEqual({
      id: 123,
      name: "Platform Engineer",
      source: "IDF",
    });
    expect(identityFetch).toHaveBeenCalledWith("/job-titles", {
      method: "POST",
      body: JSON.stringify({ name: "Platform Engineer" }),
    });
  });

  it("surfaces API errors", async () => {
    identityFetch.mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ error: "Failed to create job title" }),
    });

    await expect(createJobTitle("Platform Engineer")).rejects.toThrow(
      "Failed to create job title"
    );
  });
});
