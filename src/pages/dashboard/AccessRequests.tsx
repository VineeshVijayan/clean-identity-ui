import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Check,
  Loader2,
  X
} from "lucide-react";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { identityFetch } from "@/services/api-config";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const acceptJsonHeaders = {
  Accept: "application/json",
};

/* ─── Types ─── */
type AccessRequestEntry = {
  id: string;
  requesterName: string;
  departmentName: string;
  status: string;
  comments: string;
  requestedAt: string;
  actionedByName: string;
  actionedAt: string;
  requestType: "DELEGATE" | "COMPANY";
  companyName?: string;
  primaryContactEmail?: string;

};

export const AccessRequestsPage = () => {

  const { toast } = useToast();

  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "requests"
  );

  // ✅ EXISTING STATE (KEPT SAME)
  const [requestAccessEntries, setRequestAccessEntries] = useState<AccessRequestEntry[]>([]);
  const [approvalEntries, setApprovalEntries] = useState<AccessRequestEntry[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const getDeptId = () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.departmentId;
    } catch {
      return null;
    }
  };

  // ✅ NEW API INTEGRATION
  useEffect(() => {
    if (activeTab !== "requests") return;

    const loadRequests = async () => {
      setRequestsLoading(true);

      try {
        const res = await identityFetch("/delegates/my-requests", {
          headers: acceptJsonHeaders,
          skipLoader: true,
        });

        if (!res.ok) {
          const body = await readResponseBody(res);
          console.error(getApiErrorMessage(body, "Failed to fetch requests"));
          return;
        }

        const response = await res.json();

        const mapped = response.data.map((item: any) => {
          const status =
            item.status === "PENDING"
              ? "Pending"
              : item.status === "APPROVED"
                ? "Approved"
                : item.status === "REJECTED"
                  ? "Rejected"
                  : item.status;

          return {
            id: String(item.id),
            requesterName: item.requesterName,
            departmentName: item.departmentName,
            status,
            comments: item.comments,
            requestedAt: new Date(item.requestedAt).toLocaleString(),
            actionedAt: item.actionedAt
              ? new Date(item.actionedAt).toLocaleString()
              : "Not actioned yet",
            actionedByName:
              status === "Approved" || status === "Rejected"
                ? item.actionedByName || "Unknown User"
                : "Awaiting approval",
          };
        });

        setRequestAccessEntries(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setRequestsLoading(false);
      }
    };

    loadRequests();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "approvals") return;

    const loadApprovals = async () => {
      setApprovalsLoading(true);

      try {
        const departmentId = getDeptId();

        const delegatePromise = departmentId
          ? identityFetch(`/delegates/requests?departmentId=${departmentId}`, {
              headers: acceptJsonHeaders,
              skipLoader: true,
            }).then((res) => (res.ok ? res.json() : { data: [] }))
          : Promise.resolve({ data: [] });

        const [delegateResponse] = await Promise.all([
          delegatePromise
        ]);

        // Delegate approvals
        const delegateMapped = (delegateResponse.data || []).map((item: any) => ({
          id: `DELEGATE-${item.id}`,
          requesterName: item.requesterName,
          departmentName: item.departmentName,
          status:
            item.status === "PENDING"
              ? "Pending"
              : item.status === "APPROVED"
                ? "Approved"
                : item.status === "REJECTED"
                  ? "Rejected"
                  : item.status,
          comments: item.comments,
          requestedAt: new Date(item.requestedAt).toLocaleString(),
          requestType: "DELEGATE",
        }));
        // Merge both
        setApprovalEntries([...delegateMapped]);
      } catch (err) {
        console.error(err);
      } finally {
        setApprovalsLoading(false);
      }
    };

    loadApprovals();
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/10 text-green-500";
      case "Pending":
        return "bg-amber-500/10 text-amber-500";
      case "Rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "";
    }
  };

  const handleDelegateAction = async (
    entry: AccessRequestEntry,
    status: "APPROVED" | "REJECTED"
  ) => {
    const [, actualId] = entry.id.split("-");

    if (!actualId || entry.requestType !== "DELEGATE") {
      return;
    }

    try {
      setActionLoadingId(entry.id);

      const res = await identityFetch(`/delegates/${actualId}/action`, {
        method: "POST",
        headers: {
          ...acceptJsonHeaders,
          "Content-Type": "application/json",
        },
        skipLoader: true,
        body: JSON.stringify({
          status,
          comments: entry.comments || "",
        }),
      });

      if (!res.ok) {
        const body = await readResponseBody(res);
        toast({
          title: "Action failed",
          description: getApiErrorMessage(body, "Action failed"),
          variant: "destructive",
        });
        return;
      }

      setApprovalEntries((prev) => prev.filter((r) => r.id !== entry.id));

      toast({
        title: status === "APPROVED" ? "Approved" : "Rejected",
        description:
          status === "APPROVED"
            ? "Delegate request approved successfully"
            : "Delegate request rejected successfully",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Action failed",
        description: getErrorFromCatch(err, "Action failed"),
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Requests & Approvals</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="approvals">My Approvals</TabsTrigger>
        </TabsList>

        {/* REQUEST TAB */}
        <TabsContent value="requests">
          <div className="relative overflow-hidden rounded-lg border border-border">
            {requestsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Actioned By</TableHead>
                  <TableHead>Actioned At</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!requestsLoading && requestAccessEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requestAccessEntries.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.departmentName}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(r.status)}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.comments}</TableCell>
                      <TableCell>{r.requestedAt}</TableCell>
                      <TableCell>{r.actionedByName}</TableCell>
                      <TableCell>{r.actionedAt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <div className="relative overflow-hidden rounded-lg border border-border">
            {approvalsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Requester Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {!approvalsLoading && approvalEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No approvals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  approvalEntries.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge
                          className={
                            r.requestType === "COMPANY"
                              ? "bg-blue-500/10 text-blue-500"
                              : "bg-purple-500/10 text-purple-500"
                          }
                        >
                          {r.requestType}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.requesterName}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(r.status)}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.comments}</TableCell>
                      <TableCell>{r.requestedAt}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleDelegateAction(r, "APPROVED")}
                          disabled={
                            r.status !== "Pending" || actionLoadingId === r.id
                          }
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelegateAction(r, "REJECTED")}
                          disabled={
                            r.status !== "Pending" || actionLoadingId === r.id
                          }
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};