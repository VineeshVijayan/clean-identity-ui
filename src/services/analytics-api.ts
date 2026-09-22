import { identityFetch, type ApiRequestOptions } from "@/services/api-config";
import { parseResponse, unwrapApiData } from "@/lib/api-errors";

export type AzureSyncSnapshot = {
  processId: string;
  status: string;
  triggerSource: string | null;
  finishedAt: string | null;
  usersCreated: number;
  usersUpdated: number;
  usersDeactivated: number;
  usersSkipped: number;
};

export type AnalyticsOverview = {
  activeUsers: number;
  inactiveUsers: number;
  activeUsersFromApp: number;
  activeUsersFromEntra: number;
  activeUsersFromHr: number;
  pendingCheckoutRequests: number;
  pendingCheckoutRemovals: number;
  pendingDelegateRequests: number;
  pendingCompanyApprovals: number;
  activeAssignments: number;
  latestAzureSync: AzureSyncSnapshot | null;
  successfulLoginsLast7Days: number;
  failedLoginsLast7Days: number;
  passwordResetsLast7Days: number;
  connectorFailuresLast7Days: number;
};

export type AccessTrendPoint = {
  month: string;
  assignments: number;
  removals: number;
  accessRequests: number;
  accessRemovals: number;
  decisions: number;
};

export type ApplicationUsage = {
  applicationId: number;
  name: string;
  assignees: number;
};

export type ApplicationAnalytics = {
  activeApplications: number;
  topApplications: ApplicationUsage[];
  pendingCheckoutRequests: number;
  pendingCheckoutRemovals: number;
};

export type ActivityEvent = {
  id: number;
  occurredAt: string;
  actorUserId: number | null;
  targetUserId: number | null;
  eventType: string;
  outcome: "SUCCESS" | "FAILURE" | string;
  entityType: string | null;
  entityId: string | null;
  source: string | null;
  message: string | null;
};

export type ActivityPage = {
  content: ActivityEvent[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const readData = async <T>(response: Response): Promise<T> => {
  const body = await parseResponse(response);
  return unwrapApiData<T>(body);
};

export const getAnalyticsOverview = async (
  options?: ApiRequestOptions
): Promise<AnalyticsOverview> => {
  const response = await identityFetch("/analytics/overview", options);
  return readData<AnalyticsOverview>(response);
};

export const getAccessTrend = async (
  options?: ApiRequestOptions
): Promise<AccessTrendPoint[]> => {
  const response = await identityFetch("/analytics/access-trend", options);
  const data = await readData<AccessTrendPoint[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getApplicationAnalytics = async (
  options?: ApiRequestOptions
): Promise<ApplicationAnalytics> => {
  const response = await identityFetch("/analytics/applications", options);
  const data = await readData<ApplicationAnalytics>(response);
  return {
    activeApplications: data?.activeApplications ?? 0,
    topApplications: data?.topApplications ?? [],
    pendingCheckoutRequests: data?.pendingCheckoutRequests ?? 0,
    pendingCheckoutRemovals: data?.pendingCheckoutRemovals ?? 0,
  };
};

export const getActivity = async (
  page = 0,
  size = 8,
  options?: ApiRequestOptions
): Promise<ActivityPage> => {
  const response = await identityFetch(
    `/analytics/activity?page=${page}&size=${size}`,
    options
  );
  const data = await readData<ActivityPage>(response);
  return {
    content: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    number: data?.number ?? page,
    size: data?.size ?? size,
  };
};
