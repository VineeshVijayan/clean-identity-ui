export type BlueprintType = "global" | "company";

export const requiresJobTitles = (blueprintType: BlueprintType) => blueprintType === "global";

export type CreateBlueprintApplication = {
  applicationId: number;
  roles: string[];
};

export const buildCreateBlueprintPayload = ({
  name,
  blueprintType,
  companyId,
  jobTitleIds,
  applications,
}: {
  name: string;
  blueprintType: BlueprintType;
  companyId?: string;
  jobTitleIds: number[];
  applications: CreateBlueprintApplication[];
}) => {
  return {
    name,
    ...(blueprintType === "company" && companyId ? { companyId: Number(companyId) } : {}),
    ...(requiresJobTitles(blueprintType) ? { jobTitleIds } : {}),
    applications,
  };
};
