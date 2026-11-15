import { describe, expect, it } from "vitest";
import { toReportQuery } from "./reports-api";

describe("toReportQuery", () => {
  it("omits empty all-values so filters actually reach the API", () => {
    expect(
      toReportQuery({
        companyId: 9,
        departmentId: "all",
        active: true,
        search: "",
        missingManager: false,
        page: 0,
      })
    ).toBe("companyId=9&active=true&missingManager=false&page=0");
  });
});
