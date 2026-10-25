import { describe, expect, it } from "vitest";
import {
  confirmationCopy,
  displayCompanyName,
  displayOrDash,
  formatPersonName,
  getUniqueManagers,
  mapDelegatedUser,
  mapDelegateRelationship,
  nextManageDelegatesView,
} from "./delegate-users";

describe("delegate user mapping", () => {
  it("replaces department data with the manager name from the API", () => {
    const row = mapDelegatedUser({
      id: 3,
      firstName: "Alex",
      lastName: "Report",
      email: "alex@idsphere.net",
      departmentName: "Project Management",
      managerName: "Erin Cole",
      companyName: "Identity Sphere",
    });

    expect(row.managerName).toBe("Erin Cole");
    expect(row.companyName).toBe("Identity Sphere");
    expect(row.departmentName).toBe("Project Management");
  });

  it("shows a dash for a missing manager and Identity Sphere for a missing company", () => {
    const row = mapDelegatedUser({
      id: 4,
      firstName: "Sam",
      lastName: "Peer",
      email: "sam@idsphere.net",
    });

    expect(row.managerName).toBe("—");
    expect(row.companyName).toBe("Identity Sphere");
  });

  it("reads nested company and manager objects", () => {
    const row = mapDelegatedUser({
      id: 5,
      firstName: "Kai",
      lastName: "Lee",
      email: "kai@idsphere.net",
      manager: { firstName: "Erin", lastName: "Cole" },
      company: { name: "Northwind" },
    });

    expect(row.managerName).toBe("Erin Cole");
    expect(row.companyName).toBe("Northwind");
  });
});

describe("manage delegates navigation", () => {
  it("opens revoke access and remove delegate from the menu", () => {
    expect(nextManageDelegatesView("menu", "open-revoke")).toBe("revoke-access");
    expect(nextManageDelegatesView("menu", "open-remove")).toBe("remove-delegate");
  });

  it("returns to the menu on back or close", () => {
    expect(nextManageDelegatesView("revoke-access", "back")).toBe("menu");
    expect(nextManageDelegatesView("remove-delegate", "close")).toBe("menu");
  });
});

describe("delegate relationship mapping", () => {
  it("maps incoming and outgoing people", () => {
    expect(
      mapDelegateRelationship({
        requestId: 20,
        userId: 1,
        firstName: "Rico",
        lastName: "Lee",
        email: "rico@idsphere.net",
        companyName: "Identity Sphere",
        status: "APPROVED",
      })
    ).toEqual({
      requestId: 20,
      userId: 1,
      firstName: "Rico",
      lastName: "Lee",
      email: "rico@idsphere.net",
      companyName: "Identity Sphere",
      status: "APPROVED",
    });
  });

  it("drops incomplete relationships", () => {
    expect(mapDelegateRelationship({ firstName: "Rico" })).toBeNull();
  });
});

describe("display helpers", () => {
  it("formats names and unique managers", () => {
    expect(formatPersonName("Erin", "Cole")).toBe("Erin Cole");
    expect(displayOrDash("")).toBe("—");
    expect(displayCompanyName("")).toBe("Identity Sphere");
    expect(getUniqueManagers([
      { managerName: "Erin Cole" },
      { managerName: "—" },
      { managerName: "Erin Cole" },
      { managerName: "Pat Manager" },
    ])).toEqual(["Erin Cole", "Pat Manager"]);
  });

  it("builds confirmation copy for both destructive actions", () => {
    const person = {
      requestId: 20,
      userId: 1,
      firstName: "Rico",
      lastName: "Lee",
      email: "rico@idsphere.net",
      companyName: "Identity Sphere",
      status: "APPROVED",
    };
    expect(confirmationCopy("revoke-access", person).action).toBe("Revoke Access");
    expect(confirmationCopy("revoke-access", person).description).toContain("Rico Lee");
    expect(confirmationCopy("remove-delegate", person).action).toBe("Remove Delegate");
    expect(confirmationCopy("remove-delegate", person).description).toContain("Rico Lee");
  });
});
