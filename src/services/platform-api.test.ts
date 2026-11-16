import { beforeEach, describe, expect, it, vi } from "vitest";

const identityFetch = vi.fn();

vi.mock("@/services/api-config", () => ({
  identityFetch: (...args: unknown[]) => identityFetch(...args),
}));

import {
  listPlatformIntegrations,
  previewHrEmployees,
  syncHrEmployees,
  syncPlatformIntegration,
  testPlatformIntegration,
} from "./platform-api";

describe("platform-api", () => {
  beforeEach(() => {
    identityFetch.mockReset();
  });

  it("lists directory and HR integrations from the platform API", async () => {
    identityFetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          statusMessage: "SUCCESS",
          statusCode: 200,
          data: [
            {
              key: "azure-entra",
              displayName: "Microsoft Entra ID",
              type: "DIRECTORY",
              configured: true,
              primary: true,
              capabilities: ["CREATE_USER"],
              configuration: [
                { label: "Tenant ID", value: "contoso-tenant" },
                { label: "Client secret", value: "Configured" },
              ],
            },
          ],
        }),
    });

    await expect(listPlatformIntegrations()).resolves.toEqual([
      {
        key: "azure-entra",
        displayName: "Microsoft Entra ID",
        type: "DIRECTORY",
        configured: true,
        primary: true,
        capabilities: ["CREATE_USER"],
        configuration: [
          { label: "Tenant ID", value: "contoso-tenant" },
          { label: "Client secret", value: "Configured" },
        ],
      },
    ]);
    expect(identityFetch).toHaveBeenCalledWith("/platform/integrations");
  });

  it("tests a named integration without changing Azure or Odoo sync paths", async () => {
    identityFetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: { key: "odoo", success: true, message: "Connected to Odoo HR." },
        }),
    });

    await expect(testPlatformIntegration("odoo")).resolves.toEqual({
      key: "odoo",
      success: true,
      message: "Connected to Odoo HR.",
    });
    expect(identityFetch).toHaveBeenCalledWith("/platform/integrations/odoo/test", {
      method: "POST",
    });
  });

  it("previews HR employees for the selected provider", async () => {
    identityFetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: [{ externalId: "15", name: "Ada Lovelace", email: "ada@example.com" }],
        }),
    });

    await expect(previewHrEmployees("odoo")).resolves.toEqual([
      { externalId: "15", name: "Ada Lovelace", email: "ada@example.com" },
    ]);
    expect(identityFetch).toHaveBeenCalledWith("/platform/hr/employees/preview?provider=odoo");
  });

  it("syncs a named integration through the platform API", async () => {
    identityFetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: { key: "odoo", type: "HR", success: true, message: "Odoo HR employee sync completed" },
        }),
    });

    await expect(syncPlatformIntegration("odoo")).resolves.toEqual({
      key: "odoo",
      type: "HR",
      success: true,
      message: "Odoo HR employee sync completed",
    });
    expect(identityFetch).toHaveBeenCalledWith("/platform/integrations/odoo/sync", {
      method: "POST",
    });
  });

  it("syncs the primary HR provider", async () => {
    identityFetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: { key: "odoo", type: "HR", success: true, message: "Odoo HR employee sync completed" },
        }),
    });

    await expect(syncHrEmployees()).resolves.toMatchObject({ key: "odoo", type: "HR" });
    expect(identityFetch).toHaveBeenCalledWith("/platform/hr/employees/sync", {
      method: "POST",
    });
  });
});
