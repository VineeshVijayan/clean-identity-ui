import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  FileText,
  Send,
  ShoppingCart,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

/* ---------------- CONFIG ---------------- */
const CONNECTOR_API_BASE_URL = "https://idf-connector.ndashdigital.com/api";
const FALLBACK_IMG = "/assets/jira1.png";

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
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString() : "N/A";

  const getPriority = () => "medium"; // backend not providing yet

  /* ---------------- LOAD CHECKOUTS ---------------- */
  const loadPendingCheckouts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${CONNECTOR_API_BASE_URL}/checkout/pending`,
        { headers: authHeaders() }
      );

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
      toast({
        title: "Error",
        description: "Failed to load checkout data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCheckouts();
  }, []);

  /* ---------------- INTEGRATIONS ---------------- */
  const createUser = async (app: CheckoutItem) => {
    const name = app.applicationName.toLowerCase();

    let url = "";
    if (name.includes("jira")) {
      url = "/integrations/jira/create-user";
    } else if (name.includes("github")) {
      url = "/integrations/github/create-user";
    } else {
      toast({
        title: "Unsupported App",
        description: app.applicationName,
        variant: "destructive",
      });
      return;
    }

    await fetch(`${CONNECTOR_API_BASE_URL}${url}`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        checkoutId: app.checkoutId,
        email: app.email,
        applicationName: app.applicationName,
      }),
    });
  };

  /* ---------------- ACTION HANDLERS ---------------- */
  const confirmSubmitRequest = async () => {
    if (!selectedItem) return;
    await createUser(selectedItem);
    setRequestApps((p) =>
      p.filter((x) => x.checkoutId !== selectedItem.checkoutId)
    );
    toast({ title: "Request Submitted" });
    setShowSubmitRequestDialog(false);
  };

  const confirmDeleteRequest = () => {
    if (!selectedItem) return;
    setRequestApps((p) =>
      p.filter((x) => x.checkoutId !== selectedItem.checkoutId)
    );
    toast({ title: "Request Deleted" });
    setShowDeleteRequestDialog(false);
  };

  const confirmDeleteSingleApp = () => {
    if (!selectedItem) return;
    setDeleteApps((p) =>
      p.filter((x) => x.checkoutId !== selectedItem.checkoutId)
    );
    toast({ title: "Application Deleted" });
    setShowDeleteAppDialog(false);
  };

  const confirmSubmitAllDeletes = () => {
    setDeleteApps([]);
    toast({ title: "Applications Deleted" });
    setShowSubmitDeleteDialog(false);
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        Loading checkout data...
      </div>
    );
  }

  /* 🔴 BELOW THIS — UI IS 100% UNCHANGED 🔴 */
  return (
    <motion.div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Manage application requests and deletions
          </p>
        </div>
      </div>

      {/* REQUEST APPLICATION DETAILS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <FileText className="h-5 w-5" /> Request Application Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          {requestApps.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No pending application requests
            </p>
          ) : (
            requestApps.map((app) => (
              <Card key={app.checkoutId} className="mb-4">
                <CardContent className="p-5 flex justify-between">
                  <div>
                    <h3 className="font-semibold">{app.applicationName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {app.justification}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(app);
                        setShowDeleteRequestDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedItem(app);
                        setShowSubmitRequestDialog(true);
                      }}
                    >
                      <Send className="h-4 w-4" /> Submit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* DELETE APPLICATION */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <Trash2 className="h-5 w-5 text-destructive" /> Delete Application
          </CardTitle>
        </CardHeader>

        <CardContent>
          {deleteApps.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No applications to delete
            </p>
          ) : (
            deleteApps.map((app) => (
              <Card key={app.checkoutId} className="mb-3">
                <CardContent className="p-5 flex justify-between">
                  <span>{app.applicationName}</span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedItem(app);
                      setShowDeleteAppDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          {deleteApps.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowSubmitDeleteDialog(true)}>
                Submit Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DIALOGS — unchanged */}
      {/* Delete Request */}
      <AlertDialog open={showDeleteRequestDialog} onOpenChange={setShowDeleteRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteRequest}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Request */}
      <AlertDialog open={showSubmitRequestDialog} onOpenChange={setShowSubmitRequestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Request</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitRequest}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete App */}
      <AlertDialog open={showDeleteAppDialog} onOpenChange={setShowDeleteAppDialog}>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSingleApp}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit All Deletes */}
      <AlertDialog open={showSubmitDeleteDialog} onOpenChange={setShowSubmitDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmitAllDeletes}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
