import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  AppWindow,
  Check,
  CheckCircle,
  ChevronDown,
  Plus,
  Send,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const authHeaders = () => {
  const token = localStorage.getItem("auth-token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    Accept: "application/json",
    "Content-Type": "application/json"
  };
};

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

const CONNECTOR_API_BASE_URL = "https://idf-connector.ndashdigital.com/api";

/* ─── Types ─── */
type UserEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ssn?: string;
  role?: string;
  status?: string;
  departmentId: string;
  departmentName: string;
};


const availableProjects = ["Project Alpha", "Project Beta", "Project Gamma", "Enterprise Suite"];
const availableRoles = ["Viewer", "Editor", "Admin", "Contributor", "Read Only"];

const userApplications = [
  { id: 1, name: "Salesforce CRM", category: "CRM", accessLevel: "Full Access", grantedDate: "2023-06-15", lastUsed: "2024-01-18", isEssential: false, icon: "💼" },
  { id: 2, name: "Jira", category: "Project Management", accessLevel: "Standard", grantedDate: "2023-08-20", lastUsed: "2024-01-19", isEssential: true, icon: "📋" },
  { id: 3, name: "Slack Enterprise", category: "Communication", accessLevel: "Full Access", grantedDate: "2023-01-10", lastUsed: "2024-01-19", isEssential: true, icon: "💬" },
  { id: 4, name: "Tableau", category: "Analytics", accessLevel: "Read Only", grantedDate: "2023-11-05", lastUsed: "2024-01-15", isEssential: false, icon: "📊" },
  { id: 5, name: "GitHub Enterprise", category: "Development", accessLevel: "Contributor", grantedDate: "2023-03-22", lastUsed: "2024-01-19", isEssential: true, icon: "🐙" },
  { id: 6, name: "Confluence", category: "Documentation", accessLevel: "Standard", grantedDate: "2023-04-18", lastUsed: "2024-01-10", isEssential: false, icon: "📝" },
];

/* ─── Employee Search Dropdown ─── */
const EmployeeSearchDropdown = ({
  users,
  selectedUser,
  onSelect,
}: {
  users: UserEntry[];
  selectedUser: UserEntry | null;
  onSelect: (u: UserEntry | null) => void;
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? users.filter(
      (u) =>
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase())
    )
    : users;

  const handleSelect = (u: UserEntry) => {
    onSelect(u);
    setQuery(u.email);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onSelect(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name or email..."
          className="pl-10 pr-16"
          autoComplete="off"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden max-h-56 overflow-y-auto"
          >
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelect(u)}
                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
              >
                <p className="text-sm font-medium text-foreground">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── User Details Card ─── */
const UserDetailsCard = ({ user }: { user: UserEntry }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="border border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          Employee Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "First Name", value: user.firstName },
            { label: "Last Name", value: user.lastName },
            { label: "Mail ID", value: user.email },
            { label: "SSN", value: user.ssn || "***-**-****" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ─── Main Component ─── */
export const ApplicationManagementPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("request");
  const [availableApplications, setAvailableApplications] = useState<any[]>([]);

  // Users from API
  const [users, setUsers] = useState<UserEntry[]>([]);

  // Request Access state
  const [reqSelectedUser, setReqSelectedUser] = useState<UserEntry | null>(null);
  const [reqApp, setReqApp] = useState("");
  const [reqProject, setReqProject] = useState("");
  const [reqRole, setReqRole] = useState("");
  const [showRequestConfirm, setShowRequestConfirm] = useState(false);

  // Remove Access state
  const [remSelectedUser, setRemSelectedUser] = useState<UserEntry | null>(null);
  const [remApp, setRemApp] = useState("");
  const [remProject, setRemProject] = useState("");
  const [remRole, setRemRole] = useState("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Remove card list state
  const [selectedAppsForRemoval, setSelectedAppsForRemoval] = useState<number[]>([]);
  const [remCardList, setRemCardList] = useState(userApplications);
  const [showCardRemoveConfirm, setShowCardRemoveConfirm] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<number | null>(null);

  // New Request / Remove modals
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showNewRemoveModal, setShowNewRemoveModal] = useState(false);

  // Request Access table data
  type AccessRequestEntry = {
    id: string;
    requesterName: string;
    departmentName: string;
    status: string;
    comments: string;
    requestedAt: string;
  };

  const [requestAccessEntries, setRequestAccessEntries] = useState<AccessRequestEntry[]>([
    { id: "1", requesterName: "John Smith", departmentName: "Engineering", status: "Pending", comments: "Need Salesforce access for Q2 project", requestedAt: "2026-04-10 09:30 AM" },
    { id: "2", requesterName: "Sarah Johnson", departmentName: "Marketing", status: "Approved", comments: "Tableau access for campaign analytics", requestedAt: "2026-04-09 02:15 PM" },
    { id: "3", requesterName: "David Lee", departmentName: "Product", status: "Pending", comments: "GitHub Enterprise for code reviews", requestedAt: "2026-04-11 10:00 AM" },
  ]);

  const [removeAccessEntries, setRemoveAccessEntries] = useState<AccessRequestEntry[]>([
    { id: "4", requesterName: "Mike Davis", departmentName: "Finance", status: "Pending", comments: "Project completed — Jira access no longer needed", requestedAt: "2026-04-11 11:00 AM" },
    { id: "5", requesterName: "Emily Chen", departmentName: "HR", status: "Approved", comments: "Role change — removing Confluence access", requestedAt: "2026-04-08 04:45 PM" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleApproveRequest = (id: string) => {
    setRequestAccessEntries((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
    toast({ title: "Approved", description: "Request approved successfully." });
  };

  const handleRejectRequest = (id: string) => {
    setRequestAccessEntries((prev) => prev.map((r) => r.id === id ? { ...r, status: "Rejected" } : r));
    toast({ title: "Rejected", description: "Request rejected." });
  };

  const handleRemoveEntry = (id: string) => {
    setRemoveAccessEntries((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Removed", description: "Access removed successfully." });
  };

  /* Fetch users */
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    fetch(`${CONNECTOR_API_BASE_URL}/odoo/hr/employees`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((r) => r.json())
      .then((res) => {
        const mapped: UserEntry[] = (res || []).map((u: any) => ({
          id: u.id || u.username,
          firstName: u.name?.split(" ")[0] || "",
          lastName: u.name?.split(" ").slice(1).join(" ") || "",
          email: u.email,
          ssn: u.ssn || "",
          role: u.roles?.join(", ") || "N/A",
          status: u.status || "Active",
          departmentId: u.departmentId || "",
          departmentName: u.departmentName || "",
        }));
        setUsers(mapped);
      })
      .catch(() => { });
  }, []);

  // Fetch Request Application
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/applications`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const response = await res.json();

        const appsArray = Array.isArray(response)
          ? response
          : response.data?.content || [];

        const mappedApps = appsArray.map((app: any) => ({
          id: app.id || app.appId,
          name: app.name || app.appName,
          description: app.description || "",
        }));

        setAvailableApplications(mappedApps);
      } catch (err) {
        console.error(err);
      }
    };

    fetchApplications();
  }, []);
  /* ── Request Access submit ── */
  const handleRequestSubmit = () => {
    if (!reqSelectedUser) {
      toast({ title: "Validation Error", description: "Please select an employee.", variant: "destructive" });
      return;
    }
    if (!reqApp || !reqProject || !reqRole) {
      toast({ title: "Validation Error", description: "Please fill all application fields.", variant: "destructive" });
      return;
    }
    setShowRequestConfirm(true);
  };

  const confirmRequest = () => {
    toast({ title: "Request Submitted", description: `Access request for ${reqApp} submitted successfully.` });
    setReqApp(""); setReqProject(""); setReqRole("");
    setReqSelectedUser(null);
    setShowRequestConfirm(false);
  };

  /* ── Remove Access submit ── */
  const handleRemoveSubmit = () => {
    if (!remSelectedUser) {
      toast({ title: "Validation Error", description: "Please select an employee.", variant: "destructive" });
      return;
    }
    if (!remApp || !remProject || !remRole) {
      toast({ title: "Validation Error", description: "Please fill all application fields.", variant: "destructive" });
      return;
    }
    setShowRemoveConfirm(true);
  };

  const confirmRemove = () => {
    toast({ title: "Removal Submitted", description: `Access removal for ${remApp} submitted successfully.` });
    setRemApp(""); setRemProject(""); setRemRole("");
    setRemSelectedUser(null);
    setShowRemoveConfirm(false);
  };

  /* ── Remove card ── */
  const handleCardRemove = (id: number) => {
    const app = remCardList.find((a) => a.id === id);
    if (!app || app.isEssential) return;
    setCardToRemove(id);
    setShowCardRemoveConfirm(true);
  };

  const confirmCardRemove = () => {
    setRemCardList((prev) => prev.filter((a) => a.id !== cardToRemove));
    toast({ title: "Application Removed", description: "Application removed from your access list." });
    setShowCardRemoveConfirm(false);
    setCardToRemove(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  /* ─── Shared Application Selection Section ─── */
  const AppSelectionSection = ({
    // headerLabel,
    appValue,
    setApp,
    projectValue,
    setProject,
    roleValue,
    setRole,
    onSubmit,
    submitLabel,
    submitIcon,
    submitClass,
  }: {
    // headerLabel: string;
    appValue: string;
    setApp: (v: string) => void;
    projectValue: string;
    setProject: (v: string) => void;
    roleValue: string;
    setRole: (v: string) => void;
    onSubmit: () => void;
    submitLabel: string;
    submitIcon: React.ReactNode;
    submitClass?: string;
  }) => (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          {/* <div className="p-1.5 rounded-md bg-primary/10">
            <AppWindow className="h-4 w-4 text-primary" />
          </div> */}
          {/* {headerLabel} */}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Application</Label>
          <Select value={appValue} onValueChange={setApp}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an application..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {availableApplications.map((app) => (
                <SelectItem key={app.id} value={String(app.id)}>
                  {app.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Project</Label>
          <Select value={projectValue} onValueChange={setProject}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {availableProjects.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Role</Label>
          <Select value={roleValue} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a role..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {availableRoles.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onSubmit} className={submitClass}>
            {submitIcon}
            {submitLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <AppWindow className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Team Access</h1>
          <p className="text-muted-foreground">Request or Remove application access for team members</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-sm grid-cols-2">
            <TabsTrigger value="request" className="gap-2">
              <Send className="h-4 w-4" />
              Request Access
            </TabsTrigger>
            <TabsTrigger value="remove" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Remove Access
            </TabsTrigger>
          </TabsList>

          {/* ────────── REQUEST ACCESS TAB ────────── */}
          <TabsContent value="request" className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Access Requests</h2>
              <Button onClick={() => setShowNewRequestModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester Name</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Comments</TableHead>
                    <TableHead className="hidden sm:table-cell">Requested At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestAccessEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.requesterName}</TableCell>
                      <TableCell>{entry.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                        {entry.comments}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {entry.requestedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500 hover:bg-green-500/10 border-green-500/20"
                            onClick={() => handleApproveRequest(entry.id)}
                            disabled={entry.status !== "Pending"}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 border-destructive/20"
                            onClick={() => handleRejectRequest(entry.id)}
                            disabled={entry.status !== "Pending"}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {requestAccessEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No access requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ────────── REMOVE ACCESS TAB ────────── */}
          <TabsContent value="remove" className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Remove Access Requests</h2>
              <Button variant="destructive" onClick={() => setShowNewRemoveModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Removal
              </Button>
            </div>

            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester Name</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Comments</TableHead>
                    <TableHead className="hidden sm:table-cell">Requested At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {removeAccessEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.requesterName}</TableCell>
                      <TableCell>{entry.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                        {entry.comments}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {entry.requestedAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 border-destructive/20"
                          onClick={() => handleRemoveEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {removeAccessEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No removal requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* ─── Dialogs ─── */}
      <AlertDialog open={showRequestConfirm} onOpenChange={setShowRequestConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Access Request</AlertDialogTitle>
            <AlertDialogDescription>
              Submit access request for <strong>{reqApp}</strong> for employee <strong>{reqSelectedUser?.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRequest}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Access Removal</AlertDialogTitle>
            <AlertDialogDescription>
              Submit removal of <strong>{remApp}</strong> access for employee <strong>{remSelectedUser?.email}</strong>? This action will be processed within 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCardRemoveConfirm} onOpenChange={setShowCardRemoveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Application</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{remCardList.find((a) => a.id === cardToRemove)?.name}</strong> from your application list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCardRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
