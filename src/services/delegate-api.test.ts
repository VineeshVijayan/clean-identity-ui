import { beforeEach, describe, expect, it, vi } from "vitest";

const identityFetch = vi.fn();

vi.mock("@/services/api-config", () => ({
  identityFetch: (...args: unknown[]) => identityFetch(...args),
}));

import {
  fetchDelegatedUsers,
  fetchIncomingDelegates,
  fetchOutgoingDelegations,
  removeOutgoingDelegation,
  revokeIncomingAccess,
} from "./delegate-api";

const jsonResponse = (data: unknown, ok = true) => ({
  ok,
  json: async () => ({ data }),
  text: async () => JSON.stringify({ error: "boom" }),
});

describe("delegate-api", () => {
  beforeEach(() => {
    identityFetch.mockReset();
  });

  it("maps manager and company names from the users API", async () => {
    identityFetch.mockResolvedValue(
      jsonResponse([
        {
          id: 3,
          firstName: "Alex",
          lastName: "Report",
          email: "alex@idsphere.net",
          managerName: "Erin Cole",
          companyName: "Identity Sphere",
        },
      ])
    );

    await expect(fetchDelegatedUsers()).resolves.toEqual([
      expect.objectContaining({
        id: "3",
        managerName: "Erin Cole",
        companyName: "Identity Sphere",
      }),
    ]);
    expect(identityFetch).toHaveBeenCalledWith("/delegates/users", expect.any(Object));
  });

  it("loads incoming delegates who can see the current user's team", async () => {
    identityFetch.mockResolvedValue(
      jsonResponse([
        {
          requestId: 20,
          userId: 1,
          firstName: "Rico",
          lastName: "Lee",
          email: "rico@idsphere.net",
          companyName: "Identity Sphere",
          status: "APPROVED",
        },
      ])
    );

    await expect(fetchIncomingDelegates()).resolves.toEqual([
      expect.objectContaining({ requestId: 20, firstName: "Rico" }),
    ]);
    expect(identityFetch).toHaveBeenCalledWith("/delegates/incoming", expect.any(Object));
  });

  it("loads outgoing managers and posts revoke/remove actions", async () => {
    identityFetch
      .mockResolvedValueOnce(
        jsonResponse([
          {
            requestId: 20,
            userId: 2,
            firstName: "Erin",
            lastName: "Cole",
            email: "erin@idsphere.net",
            status: "APPROVED",
          },
        ])
      )
      .mockResolvedValueOnce(jsonResponse(null))
      .mockResolvedValueOnce(jsonResponse(null));

    await expect(fetchOutgoingDelegations()).resolves.toEqual([
      expect.objectContaining({ requestId: 20, firstName: "Erin" }),
    ]);
    await expect(revokeIncomingAccess(20)).resolves.toBeUndefined();
    await expect(removeOutgoingDelegation(21)).resolves.toBeUndefined();
    expect(identityFetch).toHaveBeenNthCalledWith(
      2,
      "/delegates/20/revoke-access",
      expect.objectContaining({ method: "POST" })
    );
    expect(identityFetch).toHaveBeenNthCalledWith(
      3,
      "/delegates/21/remove",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("surfaces API errors and keeps the caller in control of list state", async () => {
    identityFetch.mockResolvedValue(jsonResponse(null, false));

    await expect(fetchIncomingDelegates()).rejects.toThrow();
    await expect(revokeIncomingAccess(20)).rejects.toThrow("boom");
  });
});
