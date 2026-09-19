import {
  HUB_MAX_PAGE_SIZE,
  identityFetch,
  type ApiRequestOptions,
} from "@/services/api-config";
import { parseResponse, unwrapApiData } from "@/lib/api-errors";

export type AzureSyncJobStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export type AzureSyncTriggerSource = "SCHEDULER" | "API";

export type AzureSyncChangeAction =
  | "CREATED"
  | "UPDATED"
  | "DEACTIVATED"
  | "REACTIVATED"
  | "SKIPPED"
  | "ROLE_CREATED";

export type AzureSyncJob = {
  processId: string;
  jobName: string;
  triggeredBy: AzureSyncTriggerSource;
  requestedByUserId: number | null;
  status: AzureSyncJobStatus;
  createdAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  message: string | null;
  errorMessage: string | null;
  usersCreated: number;
  usersUpdated: number;
  usersDeactivated: number;
  usersSkipped: number;
  rolesCreated: number;
};

export type AzureSyncAudit = {
  id: number;
  entityType: string;
  entityId: number | null;
  azureId: string | null;
  email: string | null;
  action: AzureSyncChangeAction;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string | null;
};

export type AzureSyncJobPage = {
  content: AzureSyncJob[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const SYNC_PATH = "/azure/users/sync";

const readJob = async (response: Response): Promise<AzureSyncJob> => {
  const body = await parseResponse(response);
  return unwrapApiData<AzureSyncJob>(body);
};

export const listAzureUserSyncExecutions = async (
  page = 0,
  size = HUB_MAX_PAGE_SIZE,
  options?: ApiRequestOptions
): Promise<AzureSyncJobPage> => {
  const response = await identityFetch(`${SYNC_PATH}?page=${page}&size=${size}`, options);
  const body = await parseResponse(response);
  const data = unwrapApiData<AzureSyncJobPage>(body);
  return {
    content: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    number: data?.number ?? page,
    size: data?.size ?? size,
  };
};

export const startAzureUserSync = async (): Promise<AzureSyncJob> => {
  const response = await identityFetch(SYNC_PATH, { method: "POST" });
  return readJob(response);
};

export const getAzureUserSyncExecution = async (
  processId: string,
  options?: ApiRequestOptions
): Promise<AzureSyncJob> => {
  const response = await identityFetch(`${SYNC_PATH}/${processId}`, options);
  return readJob(response);
};

export const getAzureUserSyncAudit = async (
  processId: string
): Promise<AzureSyncAudit[]> => {
  const response = await identityFetch(`${SYNC_PATH}/${processId}/audit`);
  const body = await parseResponse(response);
  const data = unwrapApiData<AzureSyncAudit[]>(body);
  return Array.isArray(data) ? data : [];
};

export const isAzureSyncInProgress = (status: AzureSyncJobStatus) =>
  status === "PENDING" || status === "RUNNING";
