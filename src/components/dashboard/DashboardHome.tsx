import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  getAccessTrend,
  getActivity,
  getAnalyticsOverview,
  getApplicationAnalytics,
  type AccessTrendPoint,
  type ActivityEvent,
  type AnalyticsOverview,
  type ApplicationAnalytics,
} from "@/services/analytics-api";
import { motion } from "framer-motion";
import {
  Activity,
  FileText,
  Shield,
  ThumbsUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SOURCE_COLORS = ["hsl(var(--primary))", "#56C596", "#05386B"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "8px",
};

/** Read per-button config from localStorage (set via IDF Settings) */
interface BtnConfig { bgColor: string; borderColor: string; borderRadius: number[] }
const DEFAULT_CONFIGS: Record<string, BtnConfig> = {
  btn1: { bgColor: "hsl(220, 26%, 20%)", borderColor: "hsl(220, 26%, 20%)", borderRadius: [8] },
  btn2: { bgColor: "hsl(36, 80%, 48%)", borderColor: "hsl(36, 80%, 48%)", borderRadius: [8] },
  btn3: { bgColor: "hsl(0, 72%, 51%)", borderColor: "hsl(0, 72%, 51%)", borderRadius: [8] },
};
const loadBtnStyle = (key: string): React.CSSProperties => {
  try {
    const saved = localStorage.getItem(`buttonConfig_${key}`);
    if (saved) {
      const c: BtnConfig = JSON.parse(saved);
      return { backgroundColor: c.bgColor, borderColor: c.borderColor, borderRadius: `${c.borderRadius[0]}px`, borderWidth: "2px", borderStyle: "solid" };
    }
  } catch { /* ignore */ }
  const def = DEFAULT_CONFIGS[key];
  return { backgroundColor: def.bgColor, borderColor: def.borderColor, borderRadius: `${def.borderRadius[0]}px` };
};
const getAllBtnStyles = () => ({ btn1: loadBtnStyle("btn1"), btn2: loadBtnStyle("btn2"), btn3: loadBtnStyle("btn3") });

const formatCount = (value: number) => value.toLocaleString();

const formatWhen = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ");
  return date.toLocaleString();
};

const formatTrendMonth = (month: string, points: AccessTrendPoint[]) => {
  const [year, monthIndex] = month.split("-");
  const date = new Date(Number(year), Number(monthIndex) - 1, 1);
  const label = date.toLocaleString(undefined, { month: "short" });
  const years = new Set(points.map((point) => point.month.slice(0, 4)));
  return years.size > 1 ? `${label} '${year.slice(2)}` : label;
};

const eventLabel = (event: ActivityEvent) =>
  event.message?.trim() || event.eventType.replace(/_/g, " ").toLowerCase();

const barWidth = (value: number, max: number) => {
  if (value <= 0 || max <= 0) return "0%";
  return `${Math.max(8, Math.round((value / max) * 100))}%`;
};

const AccessMetric = ({
  label,
  value,
  scale,
  barClassName,
}: {
  label: string;
  value: number;
  scale: number;
  barClassName: string;
}) => (
  <div>
    <div className="flex justify-between mb-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{formatCount(value)}</span>
    </div>
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${barClassName}`} style={{ width: barWidth(value, scale) }} />
    </div>
  </div>
);

export const DashboardHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [btnStyles, setBtnStyles] = useState(getAllBtnStyles());
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trend, setTrend] = useState<AccessTrendPoint[]>([]);
  const [applications, setApplications] = useState<ApplicationAnalytics | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    const handler = () => setBtnStyles(getAllBtnStyles());
    window.addEventListener("buttonStyleChanged", handler);
    return () => window.removeEventListener("buttonStyleChanged", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const quiet = { skipLoader: true };

    const load = async () => {
      const [overviewResult, trendResult, applicationsResult, activityResult] = await Promise.allSettled([
        getAnalyticsOverview(quiet),
        getAccessTrend(quiet),
        getApplicationAnalytics(quiet),
        getActivity(0, 6, quiet),
      ]);

      if (cancelled) return;

      if (overviewResult.status === "fulfilled") setOverview(overviewResult.value);
      if (trendResult.status === "fulfilled") setTrend(trendResult.value);
      if (applicationsResult.status === "fulfilled") setApplications(applicationsResult.value);
      if (activityResult.status === "fulfilled") setActivity(activityResult.value.content);

      const failed = [overviewResult, trendResult, applicationsResult, activityResult]
        .find((result) => result.status === "rejected");
      if (failed && failed.status === "rejected") {
        toast({
          title: "Analytics unavailable",
          description: getErrorFromCatch(failed.reason, "Could not load dashboard analytics."),
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    load().catch((error) => {
      if (cancelled) return;
      setLoading(false);
      toast({
        title: "Analytics unavailable",
        description: getErrorFromCatch(error, "Could not load dashboard analytics."),
        variant: "destructive",
      });
    });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const activeUsers = overview?.activeUsers ?? 0;
  const sourceData = [
    { name: "Created in app", value: overview?.activeUsersFromApp ?? 0 },
    { name: "Entra ID", value: overview?.activeUsersFromEntra ?? 0 },
    { name: "HR", value: overview?.activeUsersFromHr ?? 0 },
  ];
  const sourceTotal = sourceData.reduce((sum, item) => sum + item.value, 0);

  const accessInFlight = overview
    ? overview.pendingCheckoutRequests
      + overview.pendingCheckoutRemovals
      + overview.pendingDelegateRequests
      + overview.pendingCompanyApprovals
    : 0;

  const barData = trend.map((point) => ({
    month: formatTrendMonth(point.month, trend),
    Assignments: point.assignments,
    Requests: point.accessRequests,
    Removals: point.removals + point.accessRemovals,
    Decisions: point.decisions,
  }));

  const topApps = applications?.topApplications ?? [];
  const topAppMax = topApps.reduce((max, app) => Math.max(max, app.assignees), 0);
  const accessScale = Math.max(
    applications?.activeApplications ?? 0,
    applications?.pendingCheckoutRequests ?? 0,
    applications?.pendingCheckoutRemovals ?? 0,
    topAppMax
  );
  const sync = overview?.latestAzureSync;

  const stats = [
    {
      label: "Active people",
      value: formatCount(activeUsers),
      detail: overview ? `${formatCount(overview.inactiveUsers)} inactive` : "—",
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Access in flight",
      value: formatCount(accessInFlight),
      detail: overview ? `${formatCount(overview.pendingCheckoutRequests)} checkout` : "—",
      icon: FileText,
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      label: "App assignments",
      value: formatCount(overview?.activeAssignments ?? 0),
      detail: "Current access",
      icon: Activity,
      color: "bg-cyan-500/10 text-cyan-600",
    },
    {
      label: "Sign-ins (7 days)",
      value: formatCount(overview?.successfulLoginsLast7Days ?? 0),
      detail: overview ? `${formatCount(overview.failedLoginsLast7Days)} failed` : "—",
      icon: Shield,
      color: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <button
          onClick={() => navigate("/users/create")}
          className="glass-card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow"
          style={{ ...btnStyles.btn1, color: "#fff" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">Create Team Member</span>
        </button>

        <button
          onClick={() => navigate("/access-requests")}
          className="glass-card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow"
          style={{ ...btnStyles.btn2, color: "#fff" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">My Requests</span>
        </button>

        <button
          onClick={() =>
            navigate("/access-requests", {
              state: { activeTab: "approvals" },
            })
          }
          className="glass-card p-6 flex items-center gap-4 hover:shadow-lg transition-shadow"
          style={{ ...btnStyles.btn3, color: "#fff" }}
        >
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
            <ThumbsUp className="h-7 w-7 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">My Approvals</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {stat.detail}
                </span>
              )}
            </div>
            {loading ? <Skeleton className="h-8 w-24 mb-1" /> : (
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
            )}
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">People by source</h3>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : sourceTotal === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              No active people yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={entry.name} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Access changes</h3>
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : barData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              No access changes in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="Assignments" fill="#2F9E44" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Requests" fill="#FAB005" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Removals" fill="#E67700" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Decisions" fill="#15AABF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold mb-6">Application access</h3>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <AccessMetric
                label="Active applications"
                value={applications?.activeApplications ?? 0}
                scale={accessScale}
                barClassName="bg-green-500"
              />

              {topApps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No current application assignments.</p>
              ) : (
                topApps.map((app) => (
                  <AccessMetric
                    key={app.applicationId}
                    label={app.name}
                    value={app.assignees}
                    scale={accessScale}
                    barClassName="bg-cyan-500"
                  />
                ))
              )}

              <AccessMetric
                label="Pending access requests"
                value={applications?.pendingCheckoutRequests ?? 0}
                scale={accessScale}
                barClassName="bg-amber-500"
              />
              <AccessMetric
                label="Pending removals"
                value={applications?.pendingCheckoutRemovals ?? 0}
                scale={accessScale}
                barClassName="bg-orange-500"
              />
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Security and audit</h3>
          {loading ? (
            <Skeleton className="h-10 w-24 mb-6" />
          ) : (
            <p className="text-4xl font-bold mb-1">{formatCount(overview?.failedLoginsLast7Days ?? 0)}</p>
          )}
          <p className="text-sm text-muted-foreground mb-6">Failed sign-ins, last 7 days</p>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Password resets</span>
              <span className="font-semibold">{formatCount(overview?.passwordResetsLast7Days ?? 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connector failures</span>
              <span className="font-semibold">{formatCount(overview?.connectorFailuresLast7Days ?? 0)}</span>
            </div>
            <div className="text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Latest Entra sync</span>
                <span className="font-semibold">{sync?.status ?? "None"}</span>
              </div>
              {sync && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatWhen(sync.finishedAt)} · created {sync.usersCreated}, updated {sync.usersUpdated}, deactivated {sync.usersDeactivated}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium">Recent activity</p>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              activity.map((event) => (
                <div key={event.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className={event.outcome === "FAILURE" ? "text-destructive" : "text-foreground"}>
                    {eventLabel(event)}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatWhen(event.occurredAt)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" variant="default" onClick={() => navigate("/access-requests")}>
              Requests
            </Button>
            <Button className="flex-1" variant="outline" onClick={() => navigate("/admin/user-sync")}>
              Sync
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
