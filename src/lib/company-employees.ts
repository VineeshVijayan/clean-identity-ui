export type CompanyEmployeeRow = {
  employeeId: number | string;
  employeeName: string;
  email: string;
  jobTitle?: string | null;
  department?: string | null;
  managerId?: number | string | null;
  managerName?: string | null;
  status?: string | null;
  createdAt?: string | null;
  lastLoginAt?: string | null;
};

export const displayManagerName = (managerName?: string | null) => {
  const name = managerName?.trim();
  return name ? name : "Not Assigned";
};

export const displayEmployeeStatus = (status?: string | null) => {
  if (!status) return "Inactive";
  return status.toUpperCase() === "ACTIVE" ? "Active" : "Inactive";
};

export const filterCompanyEmployees = (
  employees: CompanyEmployeeRow[],
  search: string
) => {
  const query = search.toLowerCase().trim();
  if (!query) return employees;
  return employees.filter((employee) => {
    const name = (employee.employeeName || "").toLowerCase();
    const email = (employee.email || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });
};

export const unwrapCompanyEmployees = (body: unknown): CompanyEmployeeRow[] => {
  if (!body || typeof body !== "object") return [];
  const record = body as { data?: unknown; employees?: unknown };
  const payload = record.data && typeof record.data === "object" ? record.data : record;
  const employees = (payload as { employees?: unknown }).employees;
  return Array.isArray(employees) ? (employees as CompanyEmployeeRow[]) : [];
};
