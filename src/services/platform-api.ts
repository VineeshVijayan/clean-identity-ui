import { parseResponse, unwrapApiData } from "@/lib/api-errors";
import { identityFetch } from "@/services/api-config";

export type IntegrationType = "DIRECTORY" | "HR";

export type IntegrationConfigItem = {
  label: string;
  value: string;
};

export type PlatformIntegration = {
  key: string;
  displayName: string;
  type: IntegrationType;
  configured: boolean;
  primary: boolean;
  capabilities: string[];
  configuration?: IntegrationConfigItem[];
};

export type IntegrationTestResult = {
  key: string;
  success: boolean;
  message: string;
};

export type IntegrationSyncResult = {
  key: string;
  type: IntegrationType;
  success: boolean;
  message: string;
};

export type HrEmployeePreview = {
  externalId: string | null;
  name: string | null;
  email: string | null;
  jobTitle: string | null;
  departmentName: string | null;
  managerName: string | null;
};

export const listPlatformIntegrations = async (): Promise<PlatformIntegration[]> => {
  const body = await parseResponse(await identityFetch("/platform/integrations"));
  return unwrapApiData<PlatformIntegration[]>(body) ?? [];
};

export const testPlatformIntegration = async (
  key: string
): Promise<IntegrationTestResult> => {
  const body = await parseResponse(
    await identityFetch(`/platform/integrations/${encodeURIComponent(key)}/test`, {
      method: "POST",
    })
  );
  return unwrapApiData<IntegrationTestResult>(body);
};

export const syncPlatformIntegration = async (
  key: string
): Promise<IntegrationSyncResult> => {
  const body = await parseResponse(
    await identityFetch(`/platform/integrations/${encodeURIComponent(key)}/sync`, {
      method: "POST",
    })
  );
  return unwrapApiData<IntegrationSyncResult>(body);
};

export const syncHrEmployees = async (
  provider?: string
): Promise<IntegrationSyncResult> => {
  const query = provider ? `?provider=${encodeURIComponent(provider)}` : "";
  const body = await parseResponse(
    await identityFetch(`/platform/hr/employees/sync${query}`, {
      method: "POST",
    })
  );
  return unwrapApiData<IntegrationSyncResult>(body);
};

export const previewHrEmployees = async (
  provider?: string
): Promise<HrEmployeePreview[]> => {
  const query = provider ? `?provider=${encodeURIComponent(provider)}` : "";
  const body = await parseResponse(
    await identityFetch(`/platform/hr/employees/preview${query}`)
  );
  return unwrapApiData<HrEmployeePreview[]>(body) ?? [];
};
