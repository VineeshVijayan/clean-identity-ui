import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorFromCatch } from "@/lib/api-errors";
import { listingPageSize } from "@/lib/platform-settings";
import { useSettings } from "@/context/SettingsContext";
import { identityFetch } from "@/services/api-config";
import { listApplications } from "@/services/application-api";
import {
  downloadReportCsv,
  getApplicationAccessReport,
  getIdentityActivityReport,
  getReportCatalog,
  getWorkforceReport,
  type ApplicationAccessReport,
  type IdentityActivityReport,
  type NamedCount,
  type ReportCatalogItem,
  type ReportQueryValue,
  type WorkforceReport,
} from "@/services/reports-api";
import { motion } from "framer-motion";
import {
  AppWindow,
  ArrowLeft,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

const REPORT_KEYS = ["workforce", "application-access", "identity-activity"] as const;
type ReportKey = (typeof REPORT_KEYS)[number];

const PIE_COLORS = ["hsl(var(--primary))", "#56C596", "#05386B", "hsl(30, 92%, 54%)", "hsl(0, 72%, 51%)"];

const ACTIVITY_TYPES = [
  "USER_CREATED",
  "USER_DEACTIVATED",
  "USER_UPDATED",
  "CONNECTOR_PROVISIONED",
  "CHECKOUT_FAILED",
  "HR_SYNC_COMPLETED",
  "HR_SYNC_FAILED",
  "APPLICATION_CONNECTION_TESTED",
  "LOGIN_FAILURE",
];

type Option = { id: string; name: string };

const isReportKey = (value?: string): value is ReportKey =>
  REPORT_KEYS.includes(value as ReportKey);

const formatCount = (value?: number | null) => Number(value ?? 0).toLocaleString();

const formatWhen = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ");
  return date.toLocaleString();
};

const toDateInput = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
};

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{formatCount(value)}</p>
    </CardContent>
  </Card>
);

const ChartCard = ({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty: boolean;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-72">
      {empty ? (
        <p className="text-sm text-muted-foreground h-full flex items-center justify-center">
          No data for the selected filters.
        </p>
      ) : (
        children
      )}
    </CardContent>
  </Card>
);

export const ReportsPage = () => {
  const { reportKey } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const pageSize = listingPageSize(settings, 20);
  const selected = isReportKey(reportKey) ? reportKey : null;

  const [catalog, setCatalog] = useState<ReportCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [companies, setCompanies] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [jobTitles, setJobTitles] = useState<Option[]>([]);
  const [applications, setApplications] = useState<Option[]>([]);

  const [companyId, setCompanyId] = useState("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [jobTitleId, setJobTitleId] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [missingManager, setMissingManager] = useState(false);
  const [missingCompany, setMissingCompany] = useState(false);
  const [search, setSearch] = useState("");
  const [applicationId, setApplicationId] = useState("all");
  const [assignmentStatus, setAssignmentStatus] = useState("all");
  const [userStatus, setUserStatus] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [fromDate, setFromDate] = useState(toDateInput(30));
  const [toDate, setToDate] = useState(toDateInput(0));
  const [page, setPage] = useState(0);

  const [workforce, setWorkforce] = useState<WorkforceReport | null>(null);
  const [access, setAccess] = useState<ApplicationAccessReport | null>(null);
  const [activity, setActivity] = useState<IdentityActivityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [companyRes, deptRes, titleRes, apps] = await Promise.all([
          identityFetch("/companies?fetchType=ALL", { skipLoader: true }),
          identityFetch("/departments", { skipLoader: true }),
          identityFetch("/job-titles", { skipLoader: true }),
          listApplications({ page: 0, size: 100, skipLoader: true }),
        ]);
        const companyBody = await companyRes.json();
        const deptBody = await deptRes.json();
        const titleBody = await titleRes.json();
        setCompanies(
          (companyBody.data || companyBody || []).map((item: { id: number; name: string }) => ({
            id: String(item.id),
            name: item.name,
          }))
        );
        setDepartments(
          (deptBody.data || []).map((item: { id: number; name: string }) => ({
            id: String(item.id),
            name: item.name,
          }))
        );
        setJobTitles(
          (titleBody.data || []).map((item: { id: number; name: string }) => ({
            id: String(item.id),
            name: item.name,
          }))
        );
        setApplications(
          (apps.content || []).map((item) => ({
            id: String(item.id),
            name: item.name,
          }))
        );
      } catch (err) {
        console.error(getErrorFromCatch(err, "Failed to load report filters"), err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      try {
        setCatalog(await getReportCatalog({ skipLoader: true }));
      } catch (err) {
        toast.error(getErrorFromCatch(err, "Failed to load reports"));
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [
    selected,
    companyId,
    departmentId,
    jobTitleId,
    status,
    source,
    missingManager,
    missingCompany,
    search,
    applicationId,
    assignmentStatus,
    userStatus,
    eventType,
    outcome,
    fromDate,
    toDate,
  ]);

  const workforceParams = useMemo(
    () => ({
      companyId: companyId === "all" ? undefined : Number(companyId),
      departmentId: departmentId === "all" ? undefined : Number(departmentId),
      jobTitleId: jobTitleId === "all" ? undefined : Number(jobTitleId),
      active: status === "all" ? undefined : status === "true",
      source: source === "all" ? undefined : source,
      missingManager: missingManager || undefined,
      missingCompany: missingCompany || undefined,
      search: search.trim() || undefined,
      page,
      size: pageSize,
    }),
    [
      companyId,
      departmentId,
      jobTitleId,
      status,
      source,
      missingManager,
      missingCompany,
      search,
      page,
      pageSize,
    ]
  );

  const accessParams = useMemo(
    () => ({
      companyId: companyId === "all" ? undefined : Number(companyId),
      applicationId: applicationId === "all" ? undefined : Number(applicationId),
      assignmentActive:
        assignmentStatus === "all" ? undefined : assignmentStatus === "true",
      userActive: userStatus === "all" ? undefined : userStatus === "true",
      page,
      size: pageSize,
    }),
    [companyId, applicationId, assignmentStatus, userStatus, page, pageSize]
  );

  const activityParams = useMemo(
    () => ({
      companyId: companyId === "all" ? undefined : Number(companyId),
      eventType: eventType === "all" ? undefined : eventType,
      outcome: outcome === "all" ? undefined : outcome,
      from: `${fromDate}T00:00:00`,
      to: `${toDate}T23:59:59`,
      page,
      size: pageSize,
    }),
    [companyId, eventType, outcome, fromDate, toDate, page, pageSize]
  );

  useEffect(() => {
    if (!selected) return;
    const load = async () => {
      setLoading(true);
      try {
        if (selected === "workforce") {
          setWorkforce(await getWorkforceReport(workforceParams, { skipLoader: true }));
        } else if (selected === "application-access") {
          setAccess(await getApplicationAccessReport(accessParams, { skipLoader: true }));
        } else {
          setActivity(await getIdentityActivityReport(activityParams, { skipLoader: true }));
        }
      } catch (err) {
        toast.error(getErrorFromCatch(err, "Failed to load report"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selected, workforceParams, accessParams, activityParams]);

  const handleExport = async () => {
    if (!selected) return;
    setExporting(true);
    try {
      const params: Record<string, ReportQueryValue> =
        selected === "workforce"
          ? { ...workforceParams, page: undefined, size: undefined }
          : selected === "application-access"
            ? { ...accessParams, page: undefined, size: undefined }
            : { ...activityParams, page: undefined, size: undefined };
      await downloadReportCsv(
        `/reports/${selected}/export`,
        params,
        `${selected}-report.csv`
      );
      toast.success("Report exported");
    } catch (err) {
      toast.error(getErrorFromCatch(err, "Export failed"));
    } finally {
      setExporting(false);
    }
  };

  const generatedAt =
    selected === "workforce"
      ? workforce?.generatedAt
      : selected === "application-access"
        ? access?.generatedAt
        : activity?.generatedAt;

  const currentPage =
    selected === "workforce"
      ? workforce?.employees
      : selected === "application-access"
        ? access?.assignments
        : activity?.events;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {selected
                ? catalog.find((item) => item.key === selected)?.name || "Report"
                : "Reports"}
            </h1>
            <p className="text-muted-foreground">
              {selected
                ? catalog.find((item) => item.key === selected)?.description
                : "Live identity, access, and activity reports from Identity Framework data."}
            </p>
          </div>
        </div>
        {selected && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/reports")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              All reports
            </Button>
            <Button onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
          </div>
        )}
      </div>

      {!selected && (
        <div className="grid gap-4 md:grid-cols-3">
          {catalogLoading ? (
            <Card>
              <CardContent className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            catalog.map((report) => (
              <Card key={report.key} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {report.key === "workforce" ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : report.key === "application-access" ? (
                      <AppWindow className="h-5 w-5 text-primary" />
                    ) : (
                      <BarChart3 className="h-5 w-5 text-primary" />
                    )}
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {report.highlights.map((item) => (
                      <Badge key={item.name} variant="secondary">
                        {item.name}: {formatCount(item.count)}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatWhen(report.generatedAt)}
                  </p>
                  <Button className="w-full" onClick={() => navigate(`/reports/${report.key}`)}>
                    View Report
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {selected && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>
                Filters are applied on the server. Generated {formatWhen(generatedAt)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect
                label="Company"
                value={companyId}
                onChange={setCompanyId}
                options={companies}
              />
              {selected === "workforce" && (
                <>
                  <FilterSelect
                    label="Department"
                    value={departmentId}
                    onChange={setDepartmentId}
                    options={departments}
                  />
                  <FilterSelect
                    label="Job title"
                    value={jobTitleId}
                    onChange={setJobTitleId}
                    options={jobTitles}
                  />
                  <FilterSelect
                    label="Status"
                    value={status}
                    onChange={setStatus}
                    options={[
                      { id: "true", name: "Active" },
                      { id: "false", name: "Inactive" },
                    ]}
                  />
                  <FilterSelect
                    label="Source"
                    value={source}
                    onChange={setSource}
                    options={[
                      { id: "APP", name: "APP" },
                      { id: "ENTRA", name: "ENTRA" },
                      { id: "HR", name: "HR" },
                    ]}
                  />
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Name or email"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm pt-7">
                    <input
                      type="checkbox"
                      checked={missingManager}
                      onChange={(event) => setMissingManager(event.target.checked)}
                    />
                    Without manager
                  </label>
                  <label className="flex items-center gap-2 text-sm pt-7">
                    <input
                      type="checkbox"
                      checked={missingCompany}
                      onChange={(event) => setMissingCompany(event.target.checked)}
                    />
                    Without company
                  </label>
                </>
              )}
              {selected === "application-access" && (
                <>
                  <FilterSelect
                    label="Application"
                    value={applicationId}
                    onChange={setApplicationId}
                    options={applications}
                  />
                  <FilterSelect
                    label="Assignment"
                    value={assignmentStatus}
                    onChange={setAssignmentStatus}
                    options={[
                      { id: "true", name: "Active access" },
                      { id: "false", name: "Removed access" },
                    ]}
                  />
                  <FilterSelect
                    label="User status"
                    value={userStatus}
                    onChange={setUserStatus}
                    options={[
                      { id: "true", name: "Active users" },
                      { id: "false", name: "Inactive users" },
                    ]}
                  />
                </>
              )}
              {selected === "identity-activity" && (
                <>
                  <div className="space-y-2">
                    <Label>From</Label>
                    <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
                  </div>
                  <FilterSelect
                    label="Event type"
                    value={eventType}
                    onChange={setEventType}
                    options={ACTIVITY_TYPES.map((type) => ({ id: type, name: type.replaceAll("_", " ") }))}
                  />
                  <FilterSelect
                    label="Outcome"
                    value={outcome}
                    onChange={setOutcome}
                    options={[
                      { id: "SUCCESS", name: "Success" },
                      { id: "FAILURE", name: "Failure" },
                    ]}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && selected === "workforce" && workforce && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <MetricCard label="Total employees" value={workforce.summary.totalEmployees} />
                <MetricCard label="Active" value={workforce.summary.activeEmployees} />
                <MetricCard label="Inactive" value={workforce.summary.inactiveEmployees} />
                <MetricCard label="Without manager" value={workforce.summary.withoutManager} />
                <MetricCard label="Without company" value={workforce.summary.withoutCompany} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <NamedPie title="Status" items={[
                  { name: "Active", count: workforce.summary.activeEmployees },
                  { name: "Inactive", count: workforce.summary.inactiveEmployees },
                ]} />
                <NamedBar title="Employees by company" items={workforce.byCompany} />
                <NamedBar title="Employees by department" items={workforce.byDepartment} />
                <NamedPie title="Source" items={workforce.bySource} />
              </div>
              <DataTable
                columns={["Employee", "Email", "Company", "Department", "Job title", "Manager", "Status", "Last login"]}
                page={workforce.employees}
                currentPage={page}
                onPage={setPage}
                rows={workforce.employees.content.map((row) => [
                  row.employeeName || "—",
                  row.email || "—",
                  row.companyName || "Unassigned",
                  row.department || "Unassigned",
                  row.jobTitle || "—",
                  row.managerName || "Not Assigned",
                  row.status || "—",
                  formatWhen(row.lastLoginAt),
                ])}
              />
            </>
          )}

          {!loading && selected === "application-access" && access && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Registered applications" value={access.summary.totalApplications} />
                <MetricCard label="Essential applications" value={access.summary.essentialApplications} />
                <MetricCard label="Active assignments" value={access.summary.activeAssignments} />
                <MetricCard label="Removed assignments" value={access.summary.removedAssignments} />
                <MetricCard label="Missing essential access" value={access.summary.usersMissingEssentialAccess} />
                <MetricCard label="Provisioning failed" value={access.summary.jobsFailed} />
                <MetricCard label="Provisioning completed" value={access.summary.jobsCompleted} />
                <MetricCard label="Failed connection tests" value={access.summary.failedConnectionTests} />
              </div>
              <NamedBar
                title="Active assignees by application"
                items={access.applications.map((app) => ({
                  name: app.applicationName,
                  count: app.activeAssignees,
                }))}
              />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Applications</CardTitle>
                  <CardDescription>
                    Assignee counts are current grants, not every registered application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Application</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Essential</TableHead>
                        <TableHead>Active assignees</TableHead>
                        <TableHead>Last connection test</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {access.applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No applications found
                          </TableCell>
                        </TableRow>
                      ) : (
                        access.applications.map((app) => (
                          <TableRow key={app.applicationId}>
                            <TableCell className="font-medium">{app.applicationName}</TableCell>
                            <TableCell>{app.active ? "Active" : "Inactive"}</TableCell>
                            <TableCell>{app.essential ? "Yes" : "No"}</TableCell>
                            <TableCell>{formatCount(app.activeAssignees)}</TableCell>
                            <TableCell>
                              {app.lastTestedAt
                                ? `${app.lastTestSuccess ? "Success" : "Failed"} · ${formatWhen(app.lastTestedAt)}`
                                : "Not tested"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <DataTable
                columns={["Employee", "Email", "Company", "Application", "Essential", "Assignment", "Assigned"]}
                page={access.assignments}
                currentPage={page}
                onPage={setPage}
                rows={access.assignments.content.map((row) => [
                  row.employeeName || "—",
                  row.email || "—",
                  row.companyName || "Unassigned",
                  row.applicationName,
                  row.essential ? "Yes" : "No",
                  row.assignmentActive ? "ACTIVE" : "REMOVED",
                  formatWhen(row.assignedAt),
                ])}
              />
            </>
          )}

          {!loading && selected === "identity-activity" && activity && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard label="Events in range" value={activity.summary.totalEvents} />
                <MetricCard label="Successful" value={activity.summary.successfulEvents} />
                <MetricCard label="Failed" value={activity.summary.failedEvents} />
                <MetricCard label="Users created" value={activity.summary.usersCreated} />
                <MetricCard label="Users deactivated" value={activity.summary.usersDeactivated} />
                <MetricCard label="Connector provisioned" value={activity.summary.connectorProvisioned} />
                <MetricCard label="Checkout failed" value={activity.summary.checkoutFailed} />
                <MetricCard label="HR sync failed" value={activity.summary.hrSyncFailed} />
              </div>
              <p className="text-sm text-muted-foreground">
                Counts come from audited activity events. User deletion is not retained after hard-delete,
                and reactivation is logged as USER_UPDATED rather than a dedicated activation event.
              </p>
              <NamedBar title="Events by type" items={activity.byEventType} />
              <DataTable
                columns={["Occurred", "Event", "Outcome", "User", "Company", "Message"]}
                page={activity.events}
                currentPage={page}
                onPage={setPage}
                rows={activity.events.content.map((row) => [
                  formatWhen(row.occurredAt),
                  row.eventType.replaceAll("_", " "),
                  row.outcome,
                  row.targetUserName || "—",
                  row.companyName || "—",
                  row.message || "—",
                ])}
              />
            </>
          )}
        </>
      )}
    </motion.div>
  );
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={`All ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const NamedPie = ({ title, items }: { title: string; items: NamedCount[] }) => {
  const data = items.filter((item) => item.count > 0);
  return (
    <ChartCard title={title} empty={data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" innerRadius={50} outerRadius={80}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const NamedBar = ({ title, items }: { title: string; items: NamedCount[] }) => {
  const data = items.slice(0, 8);
  return (
    <ChartCard title={title} empty={data.every((item) => item.count === 0) || data.length === 0}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide={data.length > 5} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const DataTable = ({
  columns,
  rows,
  page,
  currentPage,
  onPage,
}: {
  columns: string[];
  rows: string[][];
  page?: { totalElements: number; totalPages: number; size: number };
  currentPage: number;
  onPage: (page: number) => void;
}) => {
  const totalPages = Math.max(1, page?.totalPages ?? 1);
  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  No records match the selected filters
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={`${row[0]}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className={cellIndex === 0 ? "font-medium" : ""}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex items-center justify-between p-4">
        <p className="text-sm text-muted-foreground">
          {formatCount(page?.totalElements)} records
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPage(Math.max(0, currentPage - 1))}
            disabled={currentPage <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage + 1 >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
