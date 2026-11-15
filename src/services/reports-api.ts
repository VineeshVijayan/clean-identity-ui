import { getApiErrorMessage, parseResponse, unwrapApiData } from "@/lib/api-errors";
import { identityFetch, type ApiRequestOptions } from "@/services/api-config";

export type NamedCount = {
  name: string;
  count: number;
};

export type ReportPage<T> = {
  content: T[];
  totalElements: number;
  page: number;
  size: number;
  totalPages: number;
};

export type ReportCatalogItem = {
  key: string;
  name: string;
  description: string;
  generatedAt: string;
  highlights: NamedCount[];
};

export type WorkforceRow = {
  employeeId: number;
  employeeName: string | null;
  email: string | null;
  companyName: string | null;
  department: string | null;
  jobTitle: string | null;
  managerName: string | null;
  source: string | null;
  status: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
};

export type WorkforceReport = {
  generatedAt: string;
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    withoutManager: number;
    withoutCompany: number;
  };
  byCompany: NamedCount[];
  byDepartment: NamedCount[];
  byJobTitle: NamedCount[];
  bySource: NamedCount[];
  employees: ReportPage<WorkforceRow>;
};

export type ApplicationDistributionRow = {
  applicationId: number;
  applicationName: string;
  active: boolean;
  essential: boolean;
  integrationName: string | null;
  activeAssignees: number;
  lastTestedAt: string | null;
  lastTestSuccess: boolean | null;
  lastTestMessage: string | null;
};

export type ApplicationAssignmentRow = {
  assignmentId: number;
  employeeId: number;
  employeeName: string | null;
  email: string | null;
  companyName: string | null;
  userActive: boolean;
  applicationId: number;
  applicationName: string;
  essential: boolean;
  assignmentActive: boolean;
  assignedAt: string | null;
  removedAt: string | null;
};

export type ApplicationAccessReport = {
  generatedAt: string;
  summary: {
    totalApplications: number;
    activeApplications: number;
    inactiveApplications: number;
    essentialApplications: number;
    failedConnectionTests: number;
    activeAssignments: number;
    removedAssignments: number;
    usersMissingEssentialAccess: number;
    jobsCompleted: number;
    jobsFailed: number;
    jobsPending: number;
    jobsProcessing: number;
  };
  applications: ApplicationDistributionRow[];
  assignments: ReportPage<ApplicationAssignmentRow>;
};

export type IdentityActivityRow = {
  eventId: number;
  occurredAt: string;
  eventType: string;
  outcome: string;
  source: string | null;
  message: string | null;
  targetUserId: number | null;
  targetUserName: string | null;
  companyName: string | null;
};

export type IdentityActivityReport = {
  generatedAt: string;
  from: string;
  to: string;
  summary: {
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    usersCreated: number;
    usersDeactivated: number;
    connectorProvisioned: number;
    checkoutFailed: number;
    hrSyncFailed: number;
    connectionTests: number;
  };
  byEventType: NamedCount[];
  events: ReportPage<IdentityActivityRow>;
};

export type ReportQueryValue = string | number | boolean | null | undefined;

export const toReportQuery = (params: Record<string, ReportQueryValue>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") {
      return;
    }
    search.set(key, String(value));
  });
  return search.toString();
};

const readData = async <T>(response: Response): Promise<T> => {
  const body = await parseResponse(response);
  return unwrapApiData<T>(body);
};

export const getReportCatalog = async (
  options?: ApiRequestOptions
): Promise<ReportCatalogItem[]> => {
  const response = await identityFetch("/reports", options);
  const data = await readData<ReportCatalogItem[]>(response);
  return Array.isArray(data) ? data : [];
};

export const getWorkforceReport = async (
  params: Record<string, ReportQueryValue>,
  options?: ApiRequestOptions
): Promise<WorkforceReport> => {
  const query = toReportQuery(params);
  const response = await identityFetch(`/reports/workforce${query ? `?${query}` : ""}`, options);
  return readData<WorkforceReport>(response);
};

export const getApplicationAccessReport = async (
  params: Record<string, ReportQueryValue>,
  options?: ApiRequestOptions
): Promise<ApplicationAccessReport> => {
  const query = toReportQuery(params);
  const response = await identityFetch(
    `/reports/application-access${query ? `?${query}` : ""}`,
    options
  );
  return readData<ApplicationAccessReport>(response);
};

export const getIdentityActivityReport = async (
  params: Record<string, ReportQueryValue>,
  options?: ApiRequestOptions
): Promise<IdentityActivityReport> => {
  const query = toReportQuery(params);
  const response = await identityFetch(
    `/reports/identity-activity${query ? `?${query}` : ""}`,
    options
  );
  return readData<IdentityActivityReport>(response);
};

export const downloadReportCsv = async (
  path: string,
  params: Record<string, ReportQueryValue>,
  filename: string
) => {
  const query = toReportQuery(params);
  const response = await identityFetch(`${path}${query ? `?${query}` : ""}`);
  if (!response.ok) {
    const body = await parseResponse(response).catch(() => null);
    throw new Error(getApiErrorMessage(body, "Export failed"));
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
