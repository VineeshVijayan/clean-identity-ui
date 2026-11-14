import { unwrapApiData } from "@/lib/api-errors";
import { identityFetchJson } from "@/services/api-config";

export type SettingItem = {
  key: string;
  label: string;
  description: string;
  category: string;
  dataType: string;
  value: string;
  defaultValue: string;
  editable: boolean;
  allowedValues: string[];
  min?: number | null;
  max?: number | null;
  restartRequired: boolean;
};

export type SettingCategory = {
  id: string;
  label: string;
  description: string;
  settings: SettingItem[];
};

const asCategory = (body: unknown): SettingCategory => {
  const data = unwrapApiData<SettingCategory>(body);
  return {
    id: data?.id ?? "",
    label: data?.label ?? "",
    description: data?.description ?? "",
    settings: Array.isArray(data?.settings) ? data.settings : [],
  };
};

export const fetchSettingCategory = async (category: string): Promise<SettingCategory> => {
  return asCategory(await identityFetchJson(`/settings/categories/${category}`));
};

export const updateSettingCategory = async (
  category: string,
  values: Record<string, string>
): Promise<SettingCategory> => {
  return asCategory(
    await identityFetchJson(`/settings/categories/${category}`, {
      method: "PUT",
      body: JSON.stringify(values),
    })
  );
};

export const resetSettingCategory = async (category: string): Promise<SettingCategory> => {
  return asCategory(
    await identityFetchJson(`/settings/categories/${category}/reset`, {
      method: "POST",
    })
  );
};

export const saveUiSettings = async (values: Record<string, string>): Promise<void> => {
  await identityFetchJson("/settings", {
    method: "POST",
    body: JSON.stringify(values),
  });
};
