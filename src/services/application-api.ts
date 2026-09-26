import { unwrapApiData, unwrapApiList } from "@/lib/api-errors";
import {
  applicationsListPath,
  connectorFetch,
  identityFetchJson,
  type ApiRequestOptions,
} from "@/services/api-config";
import { parseResponse } from "@/lib/api-errors";
import { mapIntegrationProjects, type IntegrationProject } from "@/lib/integration-api";

export type ApplicationDto = {
  id: number;
  name: string;
  description: string | null;
  appUrl: string | null;
  integrationName: string | null;
  active: boolean;
};

export type ApplicationResourceDto = {
  id?: number | null;
  resourceId?: number | null;
  resourceName?: string | null;
  externalResourceId?: string | null;
  externalResourceKey?: string | null;
  applicationRoleId?: number | null;
  roleName?: string | null;
  externalRoleId?: string | null;
  active?: boolean;
};

export type UserApplicationDto = {
  id?: number | null;
  applicationId?: number | null;
  name?: string | null;
  description?: string | null;
  accessLevel?: string | null;
  grantedDate?: string | null;
  essential?: boolean;
  active?: boolean;
  resourceName?: string | null;
  externalResourceId?: string | null;
  externalResourceKey?: string | null;
  applicationRoleId?: number | null;
  roleName?: string | null;
  externalRoleId?: string | null;
  resources?: ApplicationResourceDto[] | null;
};

export type ApplicationAccessRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PROVISIONING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED";

export type ApplicationAccessRequestItemStatus =
  | "PENDING"
  | "APPROVED"
  | "PROVISIONING"
  | "COMPLETED"
  | "FAILED";

export type ApplicationAccessAction = "ADD" | "UPDATE" | "REMOVE";

export type ApplicationAccessRequestItem = {
  id: number;
  applicationId: number | null;
  applicationName: string | null;
  resourceId: number | null;
  resourceName: string | null;
  externalResourceId: string | null;
  externalResourceKey: string | null;
  roleId: number | null;
  roleName: string | null;
  externalRoleId: string | null;
  action: ApplicationAccessAction | null;
  status: ApplicationAccessRequestItemStatus | null;
  failureReason: string | null;
};

export type ApplicationAccessRequest = {
  id: number;
  requesterId: number | null;
  requesterEmail: string | null;
  requesterName: string | null;
  targetUserId: number | null;
  targetUserEmail: string | null;
  targetUserName: string | null;
  approverId: number | null;
  approverEmail: string | null;
  approverName: string | null;
  status: ApplicationAccessRequestStatus;
  comments: string | null;
  requestedAt: string | null;
  actionedAt: string | null;
  actionedById: number | null;
  items: ApplicationAccessRequestItem[] | null;
};

export type UserProfileResponse = {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
  dob?: string;
  maskedSsn?: string;
  ssn?: string;
  roles?: string[];
  blueprints?: string[];
  manager?: number | null;
  managerName?: string | null;
  companyName?: string | null;
  applications?: UserApplicationDto[] | null;
  applicationAccessRequestId?: number | null;
  applicationAccessMessage?: string | null;
  pendingApplicationAccessRequests?: ApplicationAccessRequest[] | null;
};

export type UserProfileUpdatePayload = {
  employeeId?: string | number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  countryCode?: string;
  ssn?: string;
  dob?: string | null;
  roles?: string[];
  blueprints?: string[];
  manager?: number | null;
  applications?: UserApplicationDto[];
};

export type IntegrationRole = {
  id: string;
  name: string;
  description?: string;
};

export type IntegrationCatalog = {
  projects: IntegrationProject[];
  roles: IntegrationRole[];
};

export type FlattenedApplicationAccess = {
  key: string;
  applicationId: number;
  applicationName: string;
  description: string;
  essential: boolean;
  grantedDate: string;
  resourceName: string;
  resourceKey: string;
  resourceId: string;
  roleName: string;
  roleId: string;
  applicationRoleId?: number | null;
  requestId?: number;
  requestStatus?: ApplicationAccessRequestStatus;
  itemStatus?: ApplicationAccessRequestItemStatus | null;
  failureReason?: string | null;
  approverName?: string | null;
  requestedAt?: string | null;
};

export type ApplicationPage = {
  content: ApplicationDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const ACCESS_REQUESTS_PATH = "/application-access-requests";

const asApplicationPage = (data: unknown): ApplicationPage => {
  if (data && typeof data === "object") {
    const record = data as Partial<ApplicationPage> & { applications?: ApplicationDto[] };
    if (Array.isArray(record.content)) {
      return {
        content: record.content,
        totalElements: record.totalElements ?? record.content.length,
        totalPages: record.totalPages ?? 1,
        number: record.number ?? 0,
        size: record.size ?? record.content.length,
      };
    }
    if (Array.isArray(record.applications)) {
      return {
        content: record.applications,
        totalElements: record.applications.length,
        totalPages: 1,
        number: 0,
        size: record.applications.length,
      };
    }
  }

  const list = unwrapApiList(data).filter(
    (item): item is ApplicationDto =>
      item != null && typeof item === "object" && "id" in (item as object)
  );
  return {
    content: list,
    totalElements: list.length,
    totalPages: 1,
    number: 0,
    size: list.length,
  };
};

const mapIntegrationRoles = (data: unknown): IntegrationRole[] =>
  unwrapApiList(data)
    .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
    .map((item) => {
      const id =
        item.id != null
          ? String(item.id)
          : item.roleId != null
            ? String(item.roleId)
            : "";
      const name =
        (typeof item.name === "string" && item.name) ||
        (typeof item.roleName === "string" && item.roleName) ||
        "";
      return {
        id,
        name,
        description: typeof item.description === "string" ? item.description : undefined,
      };
    })
    .filter((role) => role.id && role.name);

export const listApplications = async (
  options?: ApiRequestOptions
): Promise<ApplicationPage> => {
  const body = await identityFetchJson(applicationsListPath, options);
  return asApplicationPage(unwrapApiData(body));
};

export const searchApplications = async (
  name: string,
  options?: ApiRequestOptions
): Promise<ApplicationPage> => {
  const query = encodeURIComponent(name.trim());
  const body = await identityFetchJson(
    `/applications/search?name=${query}&page=0&size=100`,
    options
  );
  return asApplicationPage(unwrapApiData(body));
};

export const getApplicationById = async (
  id: number | string,
  options?: ApiRequestOptions
): Promise<ApplicationDto> => {
  const body = await identityFetchJson(`/applications/${id}`, options);
  return unwrapApiData<ApplicationDto>(body);
};

export const listUserApplications = async (
  userId: number | string,
  options?: ApiRequestOptions
): Promise<UserApplicationDto[]> => {
  const body = await identityFetchJson(`/applications/users/${userId}`, options);
  const data = unwrapApiData<UserApplicationDto[] | { applications?: UserApplicationDto[] }>(body);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.applications)) return data.applications;
  return [];
};

export const getUserProfile = async (
  userId: number | string,
  options?: ApiRequestOptions
): Promise<UserProfileResponse> => {
  const body = await identityFetchJson(`/users/${userId}`, options);
  return unwrapApiData<UserProfileResponse>(body);
};

export const updateUserProfile = async (
  userId: number | string,
  payload: UserProfileUpdatePayload,
  options?: ApiRequestOptions
): Promise<UserProfileResponse> => {
  const body = await identityFetchJson(`/users/${userId}`, {
    ...options,
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return unwrapApiData<UserProfileResponse>(body);
};

export const listMyApplicationAccessRequests = async (
  options?: ApiRequestOptions
): Promise<ApplicationAccessRequest[]> => {
  const body = await identityFetchJson(`${ACCESS_REQUESTS_PATH}/my-requests`, options);
  const data = unwrapApiData<ApplicationAccessRequest[]>(body);
  return Array.isArray(data) ? data : [];
};

export const listMyApplicationAccessApprovals = async (
  options?: ApiRequestOptions
): Promise<ApplicationAccessRequest[]> => {
  const body = await identityFetchJson(`${ACCESS_REQUESTS_PATH}/my-approvals`, options);
  const data = unwrapApiData<ApplicationAccessRequest[]>(body);
  return Array.isArray(data) ? data : [];
};

export const approveApplicationAccessRequest = async (
  requestId: number | string,
  comments?: string,
  options?: ApiRequestOptions
): Promise<ApplicationAccessRequest> => {
  const body = await identityFetchJson(`${ACCESS_REQUESTS_PATH}/${requestId}/approve`, {
    ...options,
    method: "POST",
    body: JSON.stringify({ comments: comments || null }),
  });
  return unwrapApiData<ApplicationAccessRequest>(body);
};

export const rejectApplicationAccessRequest = async (
  requestId: number | string,
  comments?: string,
  options?: ApiRequestOptions
): Promise<ApplicationAccessRequest> => {
  const body = await identityFetchJson(`${ACCESS_REQUESTS_PATH}/${requestId}/reject`, {
    ...options,
    method: "POST",
    body: JSON.stringify({ comments: comments || null }),
  });
  return unwrapApiData<ApplicationAccessRequest>(body);
};

export const loadIntegrationCatalog = async (
  integrationName: string,
  options?: ApiRequestOptions
): Promise<IntegrationCatalog> => {
  const base = `/integrations/${integrationName.toLowerCase()}`;
  const jsonHeaders = { Accept: "application/json" };

  const [rolesBody, projectsBody] = await Promise.all([
    connectorFetch(`${base}/roles`, { ...options, headers: jsonHeaders }).then((res) =>
      parseResponse(res)
    ),
    connectorFetch(`${base}/projects`, { ...options, headers: jsonHeaders }).then((res) =>
      parseResponse(res)
    ),
  ]);

  return {
    roles: mapIntegrationRoles(rolesBody),
    projects: mapIntegrationProjects(projectsBody),
  };
};
