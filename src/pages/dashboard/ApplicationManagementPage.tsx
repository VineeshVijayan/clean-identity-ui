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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AppWindow,
  CheckCircle,
  ChevronDown,
  Send,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

/* ─── Types ─── */
type UserEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ssn?: string;
  role?: string;
  status?: string;
};

const availableApplications = [
  { id: "1", name: "Salesforce CRM", description: "Customer relationship management" },
  { id: "2", name: "Jira", description: "Issue tracking and project management" },
  { id: "3", name: "Slack Enterprise", description: "Team messaging and collaboration" },
  { id: "4", name: "Tableau", description: "Data visualization and analytics" },
  { id: "5", name: "GitHub Enterprise", description: "Code hosting and version control" },
  { id: "6", name: "Confluence", description: "Team workspace and documentation" },
];

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

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.toLowerCase())
  );

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
      <Label className="text-sm font-semibold text-foreground mb-2 block">Enter Employee Name</Label>
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

  /* Fetch users */
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    fetch(`${API_BASE_URL}/users`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((r) => r.json())
      .then((res) => {
        const mapped: UserEntry[] = (res.data || []).map((u: any) => ({
          id: u.id || u.username,
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email,
          ssn: u.ssn || "",
          role: u.roles?.join(", ") || "N/A",
          status: u.status || "Active",
        }));
        setUsers(mapped);
      })
      .catch(() => {});
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
    headerLabel,
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
    headerLabel: string;
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
          <div className="p-1.5 rounded-md bg-primary/10">
            <AppWindow className="h-4 w-4 text-primary" />
          </div>
          {headerLabel}
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
                <SelectItem key={app.id} value={app.name}>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Application Management</h1>
          <p className="text-muted-foreground">Request or remove application access for employees</p>
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
            {/* Container 1 — Employee Search */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                    Employee Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EmployeeSearchDropdown
                    users={users}
                    selectedUser={reqSelectedUser}
                    onSelect={setReqSelectedUser}
                  />
                  <AnimatePresence>
                    {reqSelectedUser && <UserDetailsCard user={reqSelectedUser} />}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Container 2 — Application Selection */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                <span className="font-semibold text-foreground">Application Selection</span>
              </div>
              <AppSelectionSection
                headerLabel="Application(s) being requested"
                appValue={reqApp}
                setApp={setReqApp}
                projectValue={reqProject}
                setProject={setReqProject}
                roleValue={reqRole}
                setRole={setReqRole}
                onSubmit={handleRequestSubmit}
                submitLabel="Submit Request"
                submitIcon={<Send className="h-4 w-4 mr-2" />}
              />
            </motion.div>
          </TabsContent>

          {/* ────────── REMOVE ACCESS TAB ────────── */}
          <TabsContent value="remove" className="mt-6 space-y-5">
            {/* Info alert */}
            <Alert className="border-warning/50 bg-warning/5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertTitle className="text-warning">Important Notice</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Essential applications marked with a shield icon cannot be removed. Contact your administrator for assistance.
              </AlertDescription>
            </Alert>

            {/* Container 1 — Employee Search */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">1</span>
                    Employee Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <EmployeeSearchDropdown
                    users={users}
                    selectedUser={remSelectedUser}
                    onSelect={setRemSelectedUser}
                  />
                  <AnimatePresence>
                    {remSelectedUser && <UserDetailsCard user={remSelectedUser} />}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Container 2 — Application being Removed */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">2</span>
                <span className="font-semibold text-foreground">Application Selection</span>
              </div>
              <AppSelectionSection
                headerLabel="Application(s) being Removed"
                appValue={remApp}
                setApp={setRemApp}
                projectValue={remProject}
                setProject={setRemProject}
                roleValue={remRole}
                setRole={setRemRole}
                onSubmit={handleRemoveSubmit}
                submitLabel="Submit Removal"
                submitIcon={<Trash2 className="h-4 w-4 mr-2" />}
                submitClass="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              />
            </motion.div>

            {/* Current Apps Grid */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <AppWindow className="h-4 w-4 text-primary" />
                    </div>
                    My Current Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {remCardList.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Card
                          className={`relative transition-all duration-200 ${
                            app.isEssential
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:shadow-md cursor-pointer"
                          }`}
                        >
                          <CardContent className="pt-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{app.icon}</div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{app.name}</p>
                                  <p className="text-xs text-muted-foreground">{app.category}</p>
                                </div>
                              </div>
                              {app.isEssential ? (
                                <Shield className="h-4 w-4 text-warning" />
                              ) : (
                                <button
                                  onClick={() => handleCardRemove(app.id)}
                                  className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Access Level:</span>
                                <Badge variant="secondary" className="text-xs h-5">{app.accessLevel}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Granted:</span>
                                <span className="text-foreground">{app.grantedDate}</span>
                              </div>
                            </div>
                            {app.isEssential && (
                              <Badge variant="outline" className="mt-3 w-full justify-center bg-warning/10 text-warning border-warning/30 text-xs">
                                <Shield className="w-3 h-3 mr-1" />Essential — Cannot Remove
                              </Badge>
                            )}
                            {!app.isEssential && (
                              <Badge variant="outline" className="mt-3 w-full justify-center bg-success/10 text-success border-success/30 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />Active Access
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
            <AlertDialogAction onClick={confirmRequest}>Submit Request</AlertDialogAction>
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
