import { getErrorFromCatch, parseResponse, unwrapApiData, unwrapApiList } from "@/lib/api-errors";
import {
  connectorFetch,
  identityFetchJson,
  type ApiRequestOptions,
} from "@/services/api-config";
import { mapIntegrationProjects, type IntegrationProject } from "@/lib/integration-api";

export type ApplicationDto = {
  id: number;
  name: string;
  code?: string | null;
  description: string | null;
  category?: string | null;
  icon?: string | null;
  appUrl: string | null;
  integrationName: string | null;
  active: boolean;
  essential?: boolean | null;
  configured?: boolean;
  provisioningSupported?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastTestedAt?: string | null;
  lastTestSuccess?: boolean | null;
  lastTestMessage?: string | null;
};

export type ApplicationConfigField = {
  key: string;
  label: string;
  type?: string;
  inputType?: string;
  required?: boolean;
  sensitive?: boolean;
  defaultValue?: string | null;
  helpText?: string | null;
  editableAfterOnboarding?: boolean;
  options?: string[] | null;
};

export type ConnectorDescriptor = {
  code: string;
  displayName: string;
  provisioningSupported: boolean;
  connectionTestSupported: boolean;
  schema: ApplicationConfigField[];
};

export type ApplicationConfigurationResponse = {
  applicationId: number;
  applicationCode?: string | null;
  integrationName?: string | null;
  schema: ApplicationConfigField[];
  configuration: Record<string, string>;
  secretsConfigured: Record<string, boolean>;
  configured: boolean;
  provisioningSupported: boolean;
};

export type ConnectionTestResult = {
  success: boolean;
  supported: boolean;
  message: string;
  testedAt?: string | null;
};

export type ApplicationWritePayload = {
  name: string;
  code?: string;
  description?: string;
  category?: string;
  icon?: string;
  appUrl?: string;
  integrationName?: string | null;
  active?: boolean;
  essential?: boolean;
  schema?: ApplicationConfigField[];
  configuration?: Record<string, string>;
  secrets?: Record<string, string>;
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
  projectsError?: string;
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
  integrationName?: string | null;
};

export const isEssentialApplication = (app: {
  essential?: boolean | null;
}): boolean => app.essential === true;

export type BlueprintApplication = {
  applicationId: number;
  applicationName: string;
  essential?: boolean | null;
  roles?: string[] | null;
};

export type BlueprintRecord = {
  id?: number;
  name?: string;
  applications?: BlueprintApplication[] | null;
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

export type ApplicationListQuery = {
  page?: number;
  size?: number;
  search?: string;
  active?: boolean;
  essential?: boolean;
  integrationName?: string;
  sort?: string;
};

export const listApplications = async (
  options?: ApiRequestOptions & ApplicationListQuery
): Promise<ApplicationPage> => {
  const params = new URLSearchParams();
  params.set("page", String(options?.page ?? 0));
  params.set("size", String(options?.size ?? 100));
  if (options?.search) params.set("search", options.search);
  if (typeof options?.active === "boolean") params.set("active", String(options.active));
  if (typeof options?.essential === "boolean") params.set("essential", String(options.essential));
  if (options?.integrationName) params.set("integrationName", options.integrationName);
  if (options?.sort) params.set("sort", options.sort);
  const body = await identityFetchJson(`/applications?${params.toString()}`, options);
  return asApplicationPage(unwrapApiData(body));
};

export const listBlueprints = async (
  options?: ApiRequestOptions
): Promise<BlueprintRecord[]> => {
  const body = await identityFetchJson("/blueprints", options);
  return unwrapApiList(body).filter(
    (item): item is BlueprintRecord => item != null && typeof item === "object"
  );
};

export const listEssentialApplications = async (
  options?: ApiRequestOptions
): Promise<ApplicationDto[]> => {
  const [page, blueprints] = await Promise.all([
    listApplications(options),
    listBlueprints(options),
  ]);

  const byId = new Map<number, ApplicationDto>();

  for (const app of page.content) {
    if (app.active && isEssentialApplication(app)) {
      byId.set(app.id, { ...app, essential: true });
    }
  }

  for (const blueprint of blueprints) {
    for (const app of blueprint.applications ?? []) {
      if (!app.essential || app.applicationId == null) continue;
      const catalog = page.content.find((item) => item.id === app.applicationId);
      if (catalog && !catalog.active) continue;
      byId.set(app.applicationId, {
        id: app.applicationId,
        name: catalog?.name || app.applicationName,
        description: catalog?.description ?? null,
        appUrl: catalog?.appUrl ?? null,
        integrationName: catalog?.integrationName ?? null,
        active: catalog?.active ?? true,
        essential: true,
      });
    }
  }

  return [...byId.values()];
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

export const listApplicationConnectors = async (
  options?: ApiRequestOptions
): Promise<ConnectorDescriptor[]> => {
  const body = await identityFetchJson("/applications/connectors", options);
  const data = unwrapApiData<ConnectorDescriptor[]>(body);
  return Array.isArray(data) ? data : [];
};

export const createApplication = async (
  payload: ApplicationWritePayload,
  options?: ApiRequestOptions
): Promise<ApplicationDto> => {
  const body = await identityFetchJson("/applications", {
    ...options,
    method: "POST",
    body: JSON.stringify(payload),
  });
  return unwrapApiData<ApplicationDto>(body);
};

export const updateApplication = async (
  id: number | string,
  payload: ApplicationWritePayload,
  options?: ApiRequestOptions
): Promise<ApplicationDto> => {
  const body = await identityFetchJson(`/applications/${id}`, {
    ...options,
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return unwrapApiData<ApplicationDto>(body);
};

export const updateApplicationStatus = async (
  id: number | string,
  active: boolean,
  options?: ApiRequestOptions
): Promise<ApplicationDto> => {
  const body = await identityFetchJson(`/applications/${id}/status`, {
    ...options,
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
  return unwrapApiData<ApplicationDto>(body);
};

export const updateApplicationEssential = async (
  id: number | string,
  essential: boolean,
  options?: ApiRequestOptions
): Promise<ApplicationDto> => {
  const body = await identityFetchJson(`/applications/${id}/essential`, {
    ...options,
    method: "PATCH",
    body: JSON.stringify({ essential }),
  });
  return unwrapApiData<ApplicationDto>(body);
};

export const deleteApplication = async (
  id: number | string,
  options?: ApiRequestOptions
): Promise<void> => {
  await identityFetchJson(`/applications/${id}`, {
    ...options,
    method: "DELETE",
  });
};

export const getApplicationConfiguration = async (
  id: number | string,
  options?: ApiRequestOptions
): Promise<ApplicationConfigurationResponse> => {
  const body = await identityFetchJson(`/applications/${id}/configuration`, options);
  return unwrapApiData<ApplicationConfigurationResponse>(body);
};

export const updateApplicationConfiguration = async (
  id: number | string,
  payload: {
    schema?: ApplicationConfigField[];
    configuration?: Record<string, string>;
    secrets?: Record<string, string>;
  },
  options?: ApiRequestOptions
): Promise<ApplicationConfigurationResponse> => {
  const body = await identityFetchJson(`/applications/${id}/configuration`, {
    ...options,
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return unwrapApiData<ApplicationConfigurationResponse>(body);
};

export const testApplicationConnection = async (
  id: number | string,
  options?: ApiRequestOptions
): Promise<ConnectionTestResult> => {
  const body = await identityFetchJson(`/applications/${id}/test-connection`, {
    ...options,
    method: "POST",
  });
  return unwrapApiData<ConnectionTestResult>(body);
};

export const loadIntegrationCatalog = async (
  integrationName: string,
  options?: ApiRequestOptions
): Promise<IntegrationCatalog> => {
  const base = `/integrations/${integrationName.toLowerCase()}`;
  const jsonHeaders = { Accept: "application/json" };

  const [rolesResult, projectsResult] = await Promise.allSettled([
    connectorFetch(`${base}/roles`, { ...options, headers: jsonHeaders }).then((res) =>
      parseResponse(res)
    ),
    connectorFetch(`${base}/projects`, { ...options, headers: jsonHeaders }).then((res) =>
      parseResponse(res)
    ),
  ]);

  if (rolesResult.status === "rejected" && projectsResult.status === "rejected") {
    throw rolesResult.reason;
  }

  return {
    roles: rolesResult.status === "fulfilled" ? mapIntegrationRoles(rolesResult.value) : [],
    projects:
      projectsResult.status === "fulfilled" ? mapIntegrationProjects(projectsResult.value) : [],
    projectsError:
      projectsResult.status === "rejected"
        ? getErrorFromCatch(projectsResult.reason, "Failed to load resources")
        : undefined,
  };
};
