import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Printer,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

// Mock report data
const reportSummary = {
  totalUsers: 1247,
  activeUsers: 1089,
  inactiveUsers: 158,
  newUsersThisMonth: 87,
  accessRequests: 234,
  approvedRequests: 198,
  pendingRequests: 36,
  securityIncidents: 3,
};

const userActivityData = [
  { id: 1, user: "John Smith", email: "john.smith@company.com", department: "Engineering", lastLogin: "2024-01-15 09:30", status: "Active", actions: 156 },
  { id: 2, user: "Sarah Johnson", email: "sarah.j@company.com", department: "Marketing", lastLogin: "2024-01-15 10:15", status: "Active", actions: 89 },
  { id: 3, user: "Mike Wilson", email: "m.wilson@company.com", department: "Sales", lastLogin: "2024-01-14 16:45", status: "Active", actions: 234 },
  { id: 4, user: "Emily Davis", email: "emily.d@company.com", department: "HR", lastLogin: "2024-01-13 11:20", status: "Inactive", actions: 12 },
  { id: 5, user: "Robert Brown", email: "r.brown@company.com", department: "Finance", lastLogin: "2024-01-15 08:00", status: "Active", actions: 67 },
  { id: 6, user: "Lisa Anderson", email: "l.anderson@company.com", department: "Legal", lastLogin: "2024-01-12 14:30", status: "Inactive", actions: 5 },
  { id: 7, user: "David Lee", email: "d.lee@company.com", department: "Engineering", lastLogin: "2024-01-15 11:00", status: "Active", actions: 189 },
  { id: 8, user: "Jennifer White", email: "j.white@company.com", department: "Support", lastLogin: "2024-01-15 09:45", status: "Active", actions: 312 },
];

const accessRequestsData = [
  { id: 1, application: "Salesforce CRM", requestedBy: "John Smith", date: "2024-01-15", status: "Approved", approver: "Admin User" },
  { id: 2, application: "Microsoft Teams", requestedBy: "Sarah Johnson", date: "2024-01-14", status: "Pending", approver: "-" },
  { id: 3, application: "Jira Software", requestedBy: "Mike Wilson", date: "2024-01-13", status: "Approved", approver: "Manager" },
  { id: 4, application: "Slack", requestedBy: "Emily Davis", date: "2024-01-12", status: "Rejected", approver: "Admin User" },
  { id: 5, application: "GitHub Enterprise", requestedBy: "David Lee", date: "2024-01-11", status: "Approved", approver: "Tech Lead" },
];

export const DetailedReportPage = () => {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("last30days");
  const [department, setDepartment] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Report is being exported as ${format.toUpperCase()}...`,
    });
  };

  const handlePrint = () => {
    toast({
      title: "Preparing Print",
      description: "Opening print dialog...",
    });
    window.print();
  };

  const handleRefresh = () => {
    toast({
      title: "Report Refreshed",
      description: "Data has been updated to the latest.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
      case "Approved":
        return <Badge className="bg-success/10 text-success border-success/20">{ status }</Badge>;
      case "Inactive":
      case "Rejected":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">{status}</Badge>;
      case "Pending":
        return <Badge className="bg-warning/10 text-warning border-warning/20">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Detailed Report</h1>
              <p className="text-muted-foreground">
                Comprehensive identity management analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button size="sm" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <CardTitle className="text-lg">Report Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users, applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{reportSummary.totalUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-success">
                <ArrowUpRight className="h-4 w-4" />
                <span>+{reportSummary.newUsersThisMonth} this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-foreground">{reportSummary.activeUsers.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-success/10">
                  <Activity className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>{Math.round((reportSummary.activeUsers / reportSummary.totalUsers) * 100)}% active rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Access Requests</p>
                  <p className="text-2xl font-bold text-foreground">{reportSummary.accessRequests}</p>
                </div>
                <div className="p-3 rounded-full bg-warning/10">
                  <BarChart3 className="h-5 w-5 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-warning">
                <span>{reportSummary.pendingRequests} pending approval</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Security Incidents</p>
                  <p className="text-2xl font-bold text-foreground">{reportSummary.securityIncidents}</p>
                </div>
                <div className="p-3 rounded-full bg-destructive/10">
                  <Shield className="h-5 w-5 text-destructive" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-success">
                <ArrowDownRight className="h-4 w-4" />
                <span>-2 from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* User Activity Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>User Activity Report</CardTitle>
              </div>
              <Badge variant="secondary">{userActivityData.length} users</Badge>
            </div>
            <CardDescription>Detailed breakdown of user login activity and actions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userActivityData.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{user.user}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <span className="font-semibold">{user.actions}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Access Requests Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <CardTitle>Access Requests Summary</CardTitle>
              </div>
              <Badge variant="secondary">{accessRequestsData.length} requests</Badge>
            </div>
            <CardDescription>Recent application access requests and their status</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Application</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approver</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessRequestsData.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{request.application}</TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell className="text-muted-foreground">{request.date}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.approver}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Report Footer */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
              <p>Report generated on: {new Date().toLocaleString()}</p>
              <p>Identity Framework v2.0 | Confidential</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
