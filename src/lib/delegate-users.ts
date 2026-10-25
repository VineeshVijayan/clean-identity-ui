export type ManageDelegatesView = "menu" | "revoke-access" | "remove-delegate";

export type ManageDelegatesAction = "open-revoke" | "open-remove" | "back" | "close";

export type DelegateRelationship = {
  requestId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  status: string;
};

export type DelegatedUserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  departmentId: string;
  departmentName: string;
  managerName: string;
  companyName: string;
};

export const DEFAULT_COMPANY_NAME = "Identity Sphere";

export const displayOrDash = (value?: string | null): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
};

export const displayCompanyName = (value?: string | null): string => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "—" ? trimmed : DEFAULT_COMPANY_NAME;
};

export const formatPersonName = (
  firstName?: string | null,
  lastName?: string | null
): string => `${firstName ?? ""} ${lastName ?? ""}`.trim();

export const nextManageDelegatesView = (
  _current: ManageDelegatesView,
  action: ManageDelegatesAction
): ManageDelegatesView => {
  switch (action) {
    case "open-revoke":
      return "revoke-access";
    case "open-remove":
      return "remove-delegate";
    case "back":
    case "close":
      return "menu";
  }
};

const readNestedName = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as { name?: string; firstName?: string; lastName?: string };
    if (record.name) return record.name;
    return formatPersonName(record.firstName, record.lastName);
  }
  return "";
};

export const mapDelegatedUser = (user: {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: string | boolean;
  active?: boolean;
  departmentId?: string | number;
  departmentName?: string;
  managerName?: string;
  managerFirstName?: string;
  managerLastName?: string;
  manager?: unknown;
  companyName?: string;
  company?: unknown;
  organizationName?: string;
}): DelegatedUserRow => {
  const managerName = displayOrDash(
    user.managerName ||
      formatPersonName(user.managerFirstName, user.managerLastName) ||
      readNestedName(user.manager)
  );
  const companyName = displayCompanyName(
    user.companyName ||
      readNestedName(user.company) ||
      user.organizationName
  );

  return {
    id: String(user.id ?? ""),
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    role: "Delegate",
    status: user.status === false || user.active === false ? "Inactive" : "Active",
    lastLogin: "—",
    departmentId: user.departmentId != null ? String(user.departmentId) : "",
    departmentName: user.departmentName || "",
    managerName,
    companyName,
  };
};

export const mapDelegateRelationship = (item: {
  requestId?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  company?: unknown;
  status?: string;
}): DelegateRelationship | null => {
  if (item.requestId == null || item.userId == null) {
    return null;
  }

  return {
    requestId: Number(item.requestId),
    userId: Number(item.userId),
    firstName: item.firstName || "",
    lastName: item.lastName || "",
    email: item.email || "",
    companyName: displayCompanyName(item.companyName || readNestedName(item.company)),
    status: item.status || "APPROVED",
  };
};

export const getUniqueManagers = (users: Array<{ managerName?: string }>): string[] => {
  const managers = new Set<string>();
  users.forEach((user) => {
    if (user.managerName && user.managerName !== "—") {
      managers.add(user.managerName);
    }
  });
  return Array.from(managers).sort((a, b) => a.localeCompare(b));
};

export const confirmationCopy = (
  view: Exclude<ManageDelegatesView, "menu">,
  person: DelegateRelationship
): { title: string; description: string; action: string } => {
  const name = formatPersonName(person.firstName, person.lastName) || person.email || "this user";
  if (view === "revoke-access") {
    return {
      title: "Revoke access?",
      description: `Revoke ${name}'s delegate access to your team? They will no longer see your reports.`,
      action: "Revoke Access",
    };
  }
  return {
    title: "Remove delegate access?",
    description: `Remove yourself as a delegate for ${name}? You will no longer see that team.`,
    action: "Remove Delegate",
  };
};
