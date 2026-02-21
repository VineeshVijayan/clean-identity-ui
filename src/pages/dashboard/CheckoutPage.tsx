import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  FileText,
  Send,
  ShoppingCart,
  Trash2,
  Clock,
  User,
  CalendarDays,
  MessageSquare,
  AppWindow,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ---------------- CONFIG ---------------- */
const CONNECTOR_API_BASE_URL = "https://idf-connector.ndashdigital.com/api";

/* ---------------- APP ICON MAPPING ---------------- */
const APP_ICONS: Record<string, string> = {
  jira: "📋",
  github: "🐙",
  salesforce: "💼",
  slack: "💬",
  tableau: "📊",
  confluence: "📝",
  zendesk: "🎧",
  hubspot: "📣",
  teams: "💬",
  microsoft: "🪟",
};

const APP_DESCRIPTIONS: Record<string, string> = {
  jira: "Issue tracking and project management platform",
  github: "Code hosting and version control platform",
  salesforce: "Customer relationship management suite",
  slack: "Team messaging and collaboration hub",
  tableau: "Data visualization and analytics tool",
  confluence: "Team workspace and knowledge base",
  zendesk: "Customer support and helpdesk ticketing",
  hubspot: "Marketing automation and CRM platform",
};

const getAppIcon = (name: string): string => {
  const lower = name.toLowerCase();
  for (const key of Object.keys(APP_ICONS)) {
    if (lower.includes(key)) return APP_ICONS[key];
  }
  return "🖥️";
};

const getAppDescription = (name: string): string => {
  const lower = name.toLowerCase();
  for (const key of Object.keys(APP_DESCRIPTIONS)) {
    if (lower.includes(key)) return APP_DESCRIPTIONS[key];
  }
  return "Enterprise application access request";
};

/* ---------------- TYPES ---------------- */
interface CheckoutItem {
  checkoutId: number;
  applicationName: string;
  requestedBy: string;
  requestDate: string;
  justification: string;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  processType: "REQUEST" | "REMOVE";
  email?: string;
}

/* ---------------- COMPONENT ---------------- */
export const CheckoutPage = () => {
  const { toast } = useToast();

  const [requestApps, setRequestApps] = useState<CheckoutItem[]>([]);
  const [deleteApps, setDeleteApps] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteRequestDialog, setShowDeleteRequestDialog] = useState(false);
  const [showSubmitRequestDialog, setShowSubmitRequestDialog] = useState(false);
  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false);
  const [showSubmitDeleteDialog, setShowSubmitDeleteDialog] = useState(false);

  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null);

  /* ---------------- HELPERS ---------------- */
  const authHeaders = () => {
    const token = localStorage.getItem("auth-token");
    return { Authorization: token ? `Bearer ${token}` : "" };
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  const getPriority = () => "medium" as const;

  /* ---------------- LOAD CHECKOUTS ---------------- */
  const loadPendingCheckouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${CONNECTOR_API_BASE_URL}/checkout/pending`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      const data = json?.data || [];

      const mapped: CheckoutItem[] = data.map((it: any) => ({
        checkoutId: it.checkoutId,
        applicationName: it.applicationName,
        requestedBy: it.requestedForName || "User",
        requestDate: formatDate(it.createdAt),
        justification: it.remarks || "—",
        status: "pending",
        priority: getPriority(),
        processType: it.processType,
        email: it.email,
      }));

      setRequestApps(mapped.filter((x) => x.processType === "REQUEST"));
      setDeleteApps(mapped.filter((x) => x.processType === "REMOVE"));
    } catch {
      toast({ title: "Error", description: "Failed to load checkout data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPendingCheckouts(); }, []);

  /* ---------------- INTEGRATIONS ---------------- */
  const createUser = async (app: CheckoutItem) => {
    const name = app.applicationName.toLowerCase();
    let url = "";
    if (name.includes("jira")) url = "/integrations/jira/create-user";
    else if (name.includes("github")) url = "/integrations/github/create-user";
    else {
      toast({ title: "Unsupported App", description: app.applicationName, variant: "destructive" });
      return;
    }
    await fetch(`${CONNECTOR_API_BASE_URL}${url}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ checkoutId: app.checkoutId, email: app.email, applicationName: app.applicationName }),
    });
  };

  /* ---------------- ACTION HANDLERS ---------------- */
  const confirmSubmitRequest = async () => {
    if (!selectedItem) return;
    await createUser(selectedItem);
    setRequestApps((p) => p.filter((x) => x.checkoutId !== selectedItem.checkoutId));
    toast({ title: "Request Submitted", description: `${selectedItem.applicationName} access request submitted.` });
    setShowSubmitRequestDialog(false);
  };

  const confirmDeleteRequest = () => {
    if (!selectedItem) return;
    setRequestApps((p) => p.filter((x) => x.checkoutId !== selectedItem.checkoutId));
    toast({ title: "Request Deleted", description: `${selectedItem.applicationName} removed from cart.` });
    setShowDeleteRequestDialog(false);
  };

  const confirmDeleteSingleApp = () => {
    if (!selectedItem) return;
    setDeleteApps((p) => p.filter((x) => x.checkoutId !== selectedItem.checkoutId));
    toast({ title: "Application Removed", description: `${selectedItem.applicationName} removed from deletion queue.` });
    setShowDeleteAppDialog(false);
  };

  const confirmSubmitAllDeletes = () => {
    setDeleteApps([]);
    toast({ title: "Removal Submitted", description: "All applications have been queued for removal." });
    setShowSubmitDeleteDialog(false);
  };

  /* ---------------- CARD COMPONENT ---------------- */
  const AppCard = ({
    app,
    actions,
  }: {
    app: CheckoutItem;
    actions: React.ReactNode;
  }) => {
    const icon = getAppIcon(app.applicationName);
    const description = getAppDescription(app.applicationName);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
      >
        <Card className="hover:shadow-md transition-shadow border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-4">
              {/* App Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-3xl border border-primary/20">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base font-semibold">{app.applicationName}</CardTitle>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
                <CardDescription className="mt-1">{description}</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  <span className="text-foreground font-medium">Requested by:</span>{" "}
                  {app.requestedBy}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Date:</span>{" "}
                  {app.requestDate}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  <span className="text-foreground font-medium">Reason:</span>{" "}
                  {app.justification}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-border pt-3 gap-2 flex flex-wrap">
            {actions}
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <ShoppingCart className="h-10 w-10 animate-pulse" />
        <p>Loading checkout data...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">
              Manage application access requests and removals
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── SEGMENT 1: REQUEST APPLICATION DETAILS ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Request Application Details
            </h2>
            <p className="text-sm text-muted-foreground">
              Applications awaiting access approval — {requestApps.length} pending
            </p>
          </div>
        </div>

        {requestApps.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <AppWindow className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No pending application requests</p>
              <p className="text-sm text-muted-foreground">
                Requests you add from the application catalog will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requestApps.map((app) => (
              <AppCard
                key={app.checkoutId}
                app={app}
                actions={
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => { setSelectedItem(app); setShowDeleteRequestDialog(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => { setSelectedItem(app); setShowSubmitRequestDialog(true); }}
                    >
                      <Send className="h-4 w-4" />
                      Submit
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )}

        {requestApps.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                toast({ title: "All Requests Submitted", description: `${requestApps.length} application access requests have been submitted.` });
                setRequestApps([]);
              }}
            >
              <Send className="h-4 w-4" />
              Submit All Request
            </Button>
          </div>
        )}
      </motion.section>

      <Separator />

      {/* ── SEGMENT 2: DELETE APPLICATION ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-destructive" />
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete Application
              </h2>
              <p className="text-sm text-muted-foreground">
                Applications queued for removal — {deleteApps.length} items
              </p>
            </div>
          </div>
        </div>

        {deleteApps.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <Trash2 className="h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No applications to delete</p>
              <p className="text-sm text-muted-foreground">
                Applications you request to remove will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {deleteApps.map((app) => (
              <AppCard
                key={app.checkoutId}
                app={app}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => { setSelectedItem(app); setShowDeleteAppDialog(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove from Queue
                  </Button>
                }
              />
            ))}
          </div>
        )}

        {deleteApps.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => setShowSubmitDeleteDialog(true)}
            >
              <Send className="h-4 w-4" />
              Submit All Removals
            </Button>
          </div>
        )}
      </motion.section>

      {/* ── DIALOGS ── */}
      {/* Delete Request */}
      <AlertDialog open={showDeleteRequestDialog} onOpenChange={setShowDeleteRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Request</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{selectedItem?.applicationName}</strong> from your pending requests? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRequest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Request */}
      <AlertDialog open={showSubmitRequestDialog} onOpenChange={setShowSubmitRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Access Request</AlertDialogTitle>
            <AlertDialogDescription>
              Submit the access request for <strong>{selectedItem?.applicationName}</strong>? This will be sent to your administrator for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitRequest}>
              Submit Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Single App from Removal Queue */}
      <AlertDialog open={showDeleteAppDialog} onOpenChange={setShowDeleteAppDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Queue</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{selectedItem?.applicationName}</strong> from the deletion queue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSingleApp}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit All Deletes */}
      <AlertDialog open={showSubmitDeleteDialog} onOpenChange={setShowSubmitDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit All Removals</AlertDialogTitle>
            <AlertDialogDescription>
              Submit removal requests for all <strong>{deleteApps.length}</strong> application(s)? They will be processed within 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSubmitAllDeletes}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Submit All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
