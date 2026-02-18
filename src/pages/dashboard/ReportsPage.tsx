import { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Download,
  FileText,
  BarChart3,
  Users,
  Trash2,
  Send,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ──────────── Types ──────────── */
type ReportType = "users" | "request" | "removed";

/* ──────────── Mock Data ──────────── */
// All Users data
const usersReportData = [
  { id: 1, name: "Users Report – Q1", dateRange: "2024-2025", records: 1247 },
  { id: 2, name: "Users Report – Q2", dateRange: "2024-2025", records: 1312 },
  { id: 3, name: "Users Report – Q3", dateRange: "2024-2025", records: 1389 },
  { id: 4, name: "Users Report – Q4", dateRange: "2024-2025", records: 1421 },
];

// Request Application data
const requestReportData = [
  { id: 1, name: "Salesforce CRM Access Request", dateRange: "2024-2025", records: 48 },
  { id: 2, name: "Jira Access Request", dateRange: "2024-2025", records: 76 },
  { id: 3, name: "Slack Enterprise Request", dateRange: "2024-2025", records: 112 },
  { id: 4, name: "Tableau Access Request", dateRange: "2023-2024", records: 34 },
  { id: 5, name: "GitHub Enterprise Request", dateRange: "2023-2024", records: 89 },
];

// Removed Application data
const removedReportData = [
  { id: 1, name: "Legacy CRM – Removed", dateRange: "2024-2025", records: 23 },
  { id: 2, name: "Slack Free – Removed", dateRange: "2024-2025", records: 15 },
  { id: 3, name: "Trial Tableau – Removed", dateRange: "2023-2024", records: 41 },
];

/* ──────────── Chart Data ──────────── */
const usersChartData = [
  { month: "Jan", Users: 1200 },
  { month: "Feb", Users: 1220 },
  { month: "Mar", Users: 1247 },
  { month: "Apr", Users: 1280 },
  { month: "May", Users: 1310 },
  { month: "Jun", Users: 1312 },
  { month: "Jul", Users: 1350 },
  { month: "Aug", Users: 1370 },
  { month: "Sep", Users: 1389 },
  { month: "Oct", Users: 1400 },
  { month: "Nov", Users: 1412 },
  { month: "Dec", Users: 1421 },
];

const requestChartData = [
  { month: "Jan", Pending: 20, Approved: 45, Rejected: 5 },
  { month: "Feb", Pending: 18, Approved: 52, Rejected: 8 },
  { month: "Mar", Pending: 30, Approved: 60, Rejected: 10 },
  { month: "Apr", Pending: 22, Approved: 48, Rejected: 4 },
  { month: "May", Pending: 35, Approved: 70, Rejected: 12 },
  { month: "Jun", Pending: 28, Approved: 58, Rejected: 6 },
];

const removedChartData = [
  { month: "Jan", Removed: 5 },
  { month: "Feb", Removed: 8 },
  { month: "Mar", Removed: 12 },
  { month: "Apr", Removed: 7 },
  { month: "May", Removed: 15 },
  { month: "Jun", Removed: 10 },
];

const requestPieData = [
  { name: "Approved", value: 198 },
  { name: "Pending", value: 36 },
  { name: "Rejected", value: 22 },
];
const PIE_COLORS = ["hsl(142, 76%, 36%)", "hsl(30, 92%, 54%)", "hsl(0, 72%, 51%)"];

/* ──────────── Year Range Options ──────────── */
const yearRanges = ["2020-2021", "2021-2022", "2022-2023", "2023-2024", "2024-2025"];

/* ──────────── Helper: generate fake PDF blob ──────────── */
function downloadFakePDF(reportName: string) {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 18 Tf 72 720 Td (${reportName}) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f 
trailer<</Size 5/Root 1 0 R>>
startxref
%%EOF`;
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportName.replace(/\s+/g, "_")}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadFakeExcel(reportName: string, data: typeof usersReportData) {
  const header = "Number,Report Name,Date Range,Records\n";
  const rows = data.map((r) => `${r.id},${r.name},${r.dateRange},${r.records}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportName.replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ──────────── Component ──────────── */
export const ReportsPage = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>("users");
  const [yearRange, setYearRange] = useState("2024-2025");
  const [downloadDialog, setDownloadDialog] = useState<{ open: boolean; row: (typeof usersReportData)[0] | null }>({ open: false, row: null });

  const reportData =
    reportType === "users"
      ? usersReportData
      : reportType === "request"
      ? requestReportData
      : removedReportData;

  const reportLabel =
    reportType === "users"
      ? "Users Report"
      : reportType === "request"
      ? "Request Application Report"
      : "Removed Application Report";

  const reportIcon =
    reportType === "users" ? Users : reportType === "request" ? Send : Trash2;
  const ReportIcon = reportIcon;

  const handleConfirmDownload = (type: "pdf" | "excel") => {
    const row = downloadDialog.row;
    if (!row) return;
    if (type === "pdf") {
      downloadFakePDF(row.name);
      toast({ title: "PDF Downloaded", description: `${row.name} exported as PDF.` });
    } else {
      downloadFakeExcel(row.name, reportData);
      toast({ title: "Excel Downloaded", description: `${row.name} exported as CSV/Excel.` });
    }
    setDownloadDialog({ open: false, row: null });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              Generate, view and download identity management reports
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Report Configuration
            </CardTitle>
            <CardDescription>Select report type and year range to filter data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Report Type Dropdown */}
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select
                  value={reportType}
                  onValueChange={(v) => setReportType(v as ReportType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Users Report
                      </div>
                    </SelectItem>
                    <SelectItem value="request">
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" /> Request Application Report
                      </div>
                    </SelectItem>
                    <SelectItem value="removed">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" /> Removed Application Report
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="space-y-2">
                <Label>Year Range</Label>
                <Select value={yearRange} onValueChange={setYearRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearRanges.map((yr) => (
                      <SelectItem key={yr} value={yr}>
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Report Table ── */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReportIcon className="h-5 w-5 text-primary" />
                <CardTitle>{reportLabel}</CardTitle>
              </div>
              <Badge variant="secondary">{reportData.length} entries</Badge>
            </div>
            <CardDescription>
              {yearRange} · Click Download to export individual reports
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">No.</TableHead>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead className="text-right">Records</TableHead>
                    <TableHead className="text-center">Download Report</TableHead>
                    <TableHead className="text-center">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-muted-foreground">
                        {String(row.id).padStart(2, "0")}
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">{row.dateRange}</TableCell>
                      <TableCell className="text-right font-semibold">{row.records.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDownloadDialog({ open: true, row })}
                          className="gap-1"
                        >
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          Excel
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            downloadFakePDF(row.name);
                            toast({ title: "PDF Downloaded", description: row.name });
                          }}
                          className="gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Analytics Charts ── */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analytics – {reportLabel}
        </h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bar / Line Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {reportType === "users"
                  ? "User Growth (Monthly)"
                  : reportType === "request"
                  ? "Requests by Status (Monthly)"
                  : "Removals (Monthly)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                {reportType === "users" ? (
                  <LineChart data={usersChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="Users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                ) : reportType === "request" ? (
                  <BarChart data={requestChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="Approved" fill="hsl(142, 76%, 36%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Pending" fill="hsl(30, 92%, 54%)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Rejected" fill="hsl(0, 72%, 51%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={removedChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="Removed" fill="hsl(0, 72%, 51%)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Summary / Pie */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {reportType === "users"
                  ? "User Status Distribution"
                  : reportType === "request"
                  ? "Request Status Breakdown"
                  : "Removal Trend Overview"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reportType === "request" ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={requestPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {requestPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                /* KPI summary cards */
                <div className="space-y-4 pt-2">
                  {reportType === "users" ? (
                    <>
                      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                        <span className="text-sm text-muted-foreground">Total Users</span>
                        <span className="font-bold text-lg text-foreground">1,421</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                        <span className="text-sm text-muted-foreground">Active Users</span>
                        <span className="font-bold text-lg text-success">1,089</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                        <span className="text-sm text-muted-foreground">Inactive Users</span>
                        <span className="font-bold text-lg text-destructive">332</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <span className="text-sm text-muted-foreground">New This Year</span>
                        <span className="font-bold text-lg text-primary">+221</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
                        <span className="text-sm text-muted-foreground">Total Removed</span>
                        <span className="font-bold text-lg text-foreground">79</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                        <span className="text-sm text-muted-foreground">Peak Month</span>
                        <span className="font-bold text-lg text-destructive">May – 15</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
                        <span className="text-sm text-muted-foreground">Avg per Month</span>
                        <span className="font-bold text-lg text-warning">9.5</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Download Confirmation Dialog */}
      <AlertDialog
        open={downloadDialog.open}
        onOpenChange={(o) => !o && setDownloadDialog({ open: false, row: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Download Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              Download <strong>{downloadDialog.row?.name}</strong> as Excel (CSV)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmDownload("excel")}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Download Excel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
