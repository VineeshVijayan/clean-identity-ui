import {
  isEssentialApplication,
  type ApplicationAccessRequest,
  type ApplicationAccessRequestItem,
  type ApplicationAccessRequestStatus,
  type ApplicationResourceDto,
  type FlattenedApplicationAccess,
  type UserApplicationDto,
} from "@/services/application-api";

export { isEssentialApplication };

const OPEN_REQUEST_STATUSES: ApplicationAccessRequestStatus[] = [
  "PENDING",
  "APPROVED",
  "PROVISIONING",
];

export const GOOGLE_RESOURCE_TYPES = [
  { id: "GROUP", label: "Google Group", placeholder: "group@example.com" },
  { id: "SHARED_DRIVE", label: "Shared drive", placeholder: "Shared drive ID" },
  { id: "CALENDAR", label: "Calendar", placeholder: "calendar@example.com" },
  { id: "ORG_UNIT", label: "Organizational unit", placeholder: "/Engineering" },
] as const;

export const isGoogleIntegration = (integrationName?: string | null): boolean =>
  (integrationName || "").trim().toLowerCase() === "google";

export const resourceFieldLabel = (integrationName?: string | null): string => {
  const key = (integrationName || "").trim().toLowerCase();
  if (key === "jira") return "Project";
  return "Resource";
};

export const describeGoogleProjectsError = (message?: string | null): string => {
  if (!message) return "";
  if (/not configured|service-account/i.test(message)) {
    return "Google Workspace is not connected. Enter a group, shared drive, calendar, or org unit to continue.";
  }
  return message;
};

/** Radix Select values cannot contain `:`, which Google Workspace ids use. */
export const toSelectSafeValue = (value: string) => encodeURIComponent(value);

export const fromSelectSafeValue = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const googleResourceTypeFromKey = (resourceKey?: string | null): string => {
  if (!resourceKey) return "";
  const separator = resourceKey.indexOf(":");
  const type = (separator > 0 ? resourceKey.slice(0, separator) : resourceKey).trim().toUpperCase();
  return GOOGLE_RESOURCE_TYPES.some((item) => item.id === type) ? type : "";
};

export const googleResourceIdFromKey = (resourceKey?: string | null): string => {
  if (!resourceKey) return "";
  const separator = resourceKey.indexOf(":");
  return separator >= 0 ? resourceKey.slice(separator + 1).trim() : "";
};

export const buildGoogleResourceKey = (type: string, id: string): string =>
  id.trim() ? `${type}:${id.trim()}` : `${type}:`;

export const filterRolesForResource = <T extends { id: string }>(
  roles: T[],
  integrationName?: string | null,
  resourceKey?: string | null
): T[] => {
  const integration = (integrationName || "").trim().toLowerCase();
  if (integration !== "google") {
    return roles;
  }

  const type = googleResourceTypeFromKey(resourceKey);
  if (!type) {
    return [];
  }

  const prefix = `${type}:`;
  return roles.filter((role) => role.id.toUpperCase().startsWith(prefix));
};

export const formatRequestStatus = (status?: string | null): string => {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "Pending Approval";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "PROVISIONING":
      return "Provisioning";
    case "COMPLETED":
      return "Completed";
    case "PARTIALLY_COMPLETED":
      return "Partially Completed";
    case "FAILED":
      return "Provisioning Failed";
    case "NOT STARTED":
      return "Not Started";
    default:
      return status || "Unknown";
  }
};

export const requestStatusClassName = (status?: string | null): string => {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-700 border-amber-200";
    case "APPROVED":
    case "COMPLETED":
      return "bg-green-500/10 text-green-700 border-green-200";
    case "REJECTED":
    case "FAILED":
      return "bg-red-500/10 text-red-700 border-red-200";
    case "PROVISIONING":
      return "bg-blue-500/10 text-blue-700 border-blue-200";
    case "PARTIALLY_COMPLETED":
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const splitApprovalAndProvisioning = (
  status?: ApplicationAccessRequestStatus | string | null
): { approval: string; provisioning: string } => {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return { approval: "PENDING", provisioning: "Not Started" };
    case "APPROVED":
      return { approval: "APPROVED", provisioning: "Not Started" };
    case "REJECTED":
      return { approval: "REJECTED", provisioning: "Not Started" };
    case "PROVISIONING":
      return { approval: "APPROVED", provisioning: "PROVISIONING" };
    case "COMPLETED":
      return { approval: "APPROVED", provisioning: "COMPLETED" };
    case "PARTIALLY_COMPLETED":
      return { approval: "APPROVED", provisioning: "PARTIALLY_COMPLETED" };
    case "FAILED":
      return { approval: "APPROVED", provisioning: "FAILED" };
    default:
      return { approval: status || "Unknown", provisioning: "Unknown" };
  }
};

export const accessIdentity = (
  applicationId: number | string | null | undefined,
  resourceKey?: string | null,
  roleKey?: string | null
): string =>
  `${applicationId ?? ""}|${resourceKey || ""}|${roleKey || ""}`;

const resourceEntries = (app: UserApplicationDto): ApplicationResourceDto[] => {
  if (app.resources && app.resources.length > 0) {
    return app.resources.filter((resource) => resource.active !== false);
  }

  return [
    {
      resourceName: app.resourceName,
      externalResourceId: app.externalResourceId,
      externalResourceKey: app.externalResourceKey,
      applicationRoleId: app.applicationRoleId,
      roleName: app.roleName,
      externalRoleId: app.externalRoleId,
      active: app.active,
    },
  ];
};

export const flattenUserApplications = (
  apps: UserApplicationDto[] | null | undefined
): FlattenedApplicationAccess[] => {
  if (!apps?.length) return [];

  const result: FlattenedApplicationAccess[] = [];
  for (const app of apps) {
    if (app.active === false) continue;
    const applicationId = app.applicationId ?? app.id;
    if (applicationId == null) continue;

    for (const resource of resourceEntries(app)) {
      const resourceKey = resource.externalResourceKey || resource.externalResourceId || "";
      const roleKey = resource.externalRoleId || resource.roleName || "";
      result.push({
        key: accessIdentity(applicationId, resourceKey, roleKey),
        applicationId: Number(applicationId),
        applicationName: app.name || "Application",
        description: app.description || "",
        essential: isEssentialApplication({
          name: app.name,
          essential: app.essential,
        }),
        grantedDate: app.grantedDate || "",
        resourceName: resource.resourceName || resourceKey,
        resourceKey,
        resourceId: resource.externalResourceId || "",
        roleName: resource.roleName || "",
        roleId: resource.externalRoleId || "",
        applicationRoleId: resource.applicationRoleId ?? null,
      });
    }
  }
  return result;
};

export const flattenRequestItems = (
  items: ApplicationAccessRequestItem[] | null | undefined,
  requestId?: number
): FlattenedApplicationAccess[] => {
  if (!items?.length) return [];

  return items.map((item) => {
    const resourceKey = item.externalResourceKey || item.externalResourceId || "";
    const roleKey = item.externalRoleId || item.roleName || "";
    return {
      key: `${requestId ?? "req"}|${accessIdentity(item.applicationId, resourceKey, roleKey)}`,
      applicationId: Number(item.applicationId ?? 0),
      applicationName: item.applicationName || "Application",
      description: "",
      essential: false,
      grantedDate: "",
      resourceName: item.resourceName || resourceKey,
      resourceKey,
      resourceId: item.externalResourceId || "",
      roleName: item.roleName || "",
      roleId: item.externalRoleId || "",
      applicationRoleId: item.roleId ?? null,
      itemStatus: item.status,
      failureReason: item.failureReason,
    };
  });
};

export const flattenPendingRequests = (
  requests: ApplicationAccessRequest[] | null | undefined
): FlattenedApplicationAccess[] => {
  if (!requests?.length) return [];

  return requests
    .filter((request) => OPEN_REQUEST_STATUSES.includes(request.status))
    .flatMap((request) =>
      flattenRequestItems(request.items, request.id).map((item) => ({
        ...item,
        requestId: request.id,
        requestStatus: request.status,
        approverName: request.approverName,
        requestedAt: request.requestedAt,
      }))
    );
};

export const toUserApplicationPayload = (
  entries: FlattenedApplicationAccess[]
): UserApplicationDto[] => {
  const byApp = new Map<number, UserApplicationDto>();

  for (const entry of entries) {
    const existing = byApp.get(entry.applicationId) ?? {
      applicationId: entry.applicationId,
      name: entry.applicationName,
      resources: [],
    };

    const hasResource =
      Boolean(entry.resourceKey) ||
      Boolean(entry.resourceName) ||
      Boolean(entry.roleName) ||
      Boolean(entry.roleId);

    if (hasResource) {
      existing.resources = [
        ...(existing.resources ?? []),
        {
          resourceName: entry.resourceName || null,
          externalResourceId: entry.resourceId || null,
          externalResourceKey: entry.resourceKey || null,
          roleName: entry.roleName || null,
          externalRoleId: entry.roleId || null,
          applicationRoleId: entry.applicationRoleId,
        },
      ];
    }

    byApp.set(entry.applicationId, existing);
  }

  return [...byApp.values()].map((app) =>
    app.resources && app.resources.length > 0
      ? app
      : { applicationId: app.applicationId, name: app.name }
  );
};

export const formatAccessLine = (entry: {
  resourceName?: string | null;
  resourceKey?: string | null;
  roleName?: string | null;
}): string => {
  const resource = entry.resourceName || entry.resourceKey || "";
  const role = entry.roleName || "";
  if (resource && role) return `${resource} / ${role}`;
  return resource || role || "—";
};

export const summarizeRequestItems = (
  items: ApplicationAccessRequestItem[] | null | undefined
): string => {
  if (!items?.length) return "—";
  const names = [...new Set(items.map((item) => item.applicationName).filter(Boolean))];
  if (names.length === 1 && items.length === 1) {
    return `${names[0]} · ${formatAccessLine({
      resourceName: items[0].resourceName,
      resourceKey: items[0].externalResourceKey,
      roleName: items[0].roleName,
    })}`;
  }
  if (names.length === 1) return `${names[0]} (${items.length} items)`;
  return names.join(", ");
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

export const formatDate = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};
