import { describe, expect, it } from "vitest";
import {
  displayEmployeeStatus,
  displayManagerName,
  filterCompanyEmployees,
  unwrapCompanyEmployees,
  type CompanyEmployeeRow,
} from "./company-employees";

const employees: CompanyEmployeeRow[] = [
  {
    employeeId: "emp-101",
    employeeName: "John Lee",
    email: "john@example.com",
    managerName: "David Cole",
    status: "ACTIVE",
  },
  {
    employeeId: "emp-102",
    employeeName: "Mary Chen",
    email: "mary@example.com",
    managerName: null,
    status: "INACTIVE",
  },
];

describe("company employees", () => {
  it("shows Not Assigned when a manager is missing", () => {
    expect(displayManagerName(null)).toBe("Not Assigned");
    expect(displayManagerName("  ")).toBe("Not Assigned");
    expect(displayManagerName("David Cole")).toBe("David Cole");
  });

  it("maps active and inactive statuses", () => {
    expect(displayEmployeeStatus("ACTIVE")).toBe("Active");
    expect(displayEmployeeStatus("INACTIVE")).toBe("Inactive");
    expect(displayEmployeeStatus(null)).toBe("Inactive");
  });

  it("filters by employee name or email without leaking other rows", () => {
    expect(filterCompanyEmployees(employees, "john")).toEqual([employees[0]]);
    expect(filterCompanyEmployees(employees, "MARY@EXAMPLE.COM")).toEqual([employees[1]]);
    expect(filterCompanyEmployees(employees, "nobody")).toEqual([]);
  });

  it("unwraps the company employees API payload", () => {
    expect(
      unwrapCompanyEmployees({
        data: {
          companyId: 9,
          companyName: "ABC Technologies",
          totalEmployees: 2,
          employees,
        },
      })
    ).toEqual(employees);
  });
});
