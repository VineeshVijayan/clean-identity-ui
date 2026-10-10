import { getApiErrorMessage, readResponseBody } from "@/lib/api-errors";
import { normalizeJobTitleName } from "@/lib/job-title-picker";
import { identityFetch } from "@/services/api-config";

export type JobTitleRecord = {
  id: number;
  name: string;
  source?: string;
};

export const createJobTitle = async (name: string): Promise<JobTitleRecord> => {
  const trimmed = normalizeJobTitleName(name);
  if (!trimmed) {
    throw new Error("Job title is required");
  }

  const res = await identityFetch("/job-titles", {
    method: "POST",
    body: JSON.stringify({ name: trimmed }),
  });

  if (!res.ok) {
    const body = await readResponseBody(res);
    throw new Error(getApiErrorMessage(body, "Failed to create job title"));
  }

  const response = await res.json();
  const created = response.data ?? response;
  if (created?.id == null || !created.name) {
    throw new Error("Failed to create job title");
  }

  return {
    id: Number(created.id),
    name: String(created.name),
    source: created.source,
  };
};
