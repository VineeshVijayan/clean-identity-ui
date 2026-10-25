import { getApiErrorMessage, readResponseBody } from "@/lib/api-errors";
import {
  mapDelegatedUser,
  mapDelegateRelationship,
  type DelegateRelationship,
  type DelegatedUserRow,
} from "@/lib/delegate-users";
import { identityFetch } from "@/services/api-config";

const acceptJsonHeaders = {
  Accept: "application/json",
};

const readList = async <T>(
  res: Response,
  fallbackMessage: string,
  mapItem: (item: T) => unknown
) => {
  if (!res.ok) {
    const body = await readResponseBody(res);
    throw new Error(getApiErrorMessage(body, fallbackMessage));
  }
  const response = await res.json();
  return (response.data || []).map(mapItem);
};

export const fetchDelegatedUsers = async (): Promise<DelegatedUserRow[]> => {
  const res = await identityFetch("/delegates/users", {
    headers: acceptJsonHeaders,
    skipLoader: true,
  });
  return readList(res, "Failed to fetch delegate users", mapDelegatedUser);
};

export const fetchIncomingDelegates = async (): Promise<DelegateRelationship[]> => {
  const res = await identityFetch("/delegates/incoming", {
    headers: acceptJsonHeaders,
    skipLoader: true,
  });
  return (await readList(
    res,
    "Failed to load people with access to your team",
    mapDelegateRelationship
  )).filter((item): item is DelegateRelationship => item != null);
};

export const fetchOutgoingDelegations = async (): Promise<DelegateRelationship[]> => {
  const res = await identityFetch("/delegates/outgoing", {
    headers: acceptJsonHeaders,
    skipLoader: true,
  });
  return (await readList(
    res,
    "Failed to load managers you can access",
    mapDelegateRelationship
  )).filter((item): item is DelegateRelationship => item != null);
};

const postDelegateAction = async (
  path: string,
  fallbackMessage: string
): Promise<void> => {
  const res = await identityFetch(path, {
    method: "POST",
    headers: acceptJsonHeaders,
    skipLoader: true,
  });
  if (!res.ok) {
    const body = await readResponseBody(res);
    throw new Error(getApiErrorMessage(body, fallbackMessage));
  }
};

export const revokeIncomingAccess = (requestId: number): Promise<void> =>
  postDelegateAction(
    `/delegates/${requestId}/revoke-access`,
    "Failed to revoke delegate access"
  );

export const removeOutgoingDelegation = (requestId: number): Promise<void> =>
  postDelegateAction(
    `/delegates/${requestId}/remove`,
    "Failed to remove delegate access"
  );
