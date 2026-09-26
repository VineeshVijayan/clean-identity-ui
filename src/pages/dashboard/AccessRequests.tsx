import { ApplicationAccessRequestDetailsDialog } from "@/components/dashboard/ApplicationAccessRequestDetailsDialog";
import { ApplicationStatusBadge } from "@/components/dashboard/ApplicationStatusBadge";
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
  formatDateTime,
  formatRequestStatus,
  splitApprovalAndProvisioning,
  summarizeRequestItems,
} from "@/lib/application-access";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import {
  approveApplicationAccessRequest,
  listMyApplicationAccessApprovals,
  listMyApplicationAccessRequests,
  rejectApplicationAccessRequest,
  type ApplicationAccessRequest,
} from "@/services/application-api";
import { identityFetch } from "@/services/api-config";
import {
  Check,
  Eye,
  Loader2,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const acceptJsonHeaders = {
  Accept: "application/json",
};

type RequestKind = "DELEGATE" | "COMPANY" | "APPLICATION";

type AccessRequestEntry = {
  id: string;
  numericId: number;
  requesterName: string;
  targetUserName?: string;
  departmentName: string;
  status: string;
  comments: string;
  requestedAt: string;
  actionedByName: string;
  actionedAt: string;
  requestType: RequestKind;
  companyName?: string;
  primaryContactEmail?: string;
  approverName?: string;
  applicationsSummary?: string;
  applicationRequest?: ApplicationAccessRequest;
};

const mapApplicationRequest = (item: ApplicationAccessRequest): AccessRequestEntry => ({
  id: `APPLICATION-${item.id}`,
  numericId: item.id,
  requesterName: item.requesterName || "—",
  targetUserName: item.targetUserName || "—",
  departmentName: "",
  status: item.status,
  comments: item.comments || "",
  requestedAt: formatDateTime(item.requestedAt),
  actionedAt: formatDateTime(item.actionedAt),
  actionedByName: item.approverName || "—",
  requestType: "APPLICATION",
  approverName: item.approverName || "—",
  applicationsSummary: summarizeRequestItems(item.items),
  applicationRequest: item,
});

export const AccessRequestsPage = () => {
  const { toast } = useToast();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || "requests"
  );

  const [requestAccessEntries, setRequestAccessEntries] = useState<AccessRequestEntry[]>([]);
  const [approvalEntries, setApprovalEntries] = useState<AccessRequestEntry[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [approvalsLoading, setApprovalsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState("");
  const [approvalsError, setApprovalsError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ApplicationAccessRequest | null>(null);
  const [detailsAllowActions, setDetailsAllowActions] = useState(false);

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

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError("");

    try {
      const delegatePromise = identityFetch("/delegates/my-requests", {
        headers: acceptJsonHeaders,
        skipLoader: true,
      }).then(async (res) => {
        if (!res.ok) {
          const body = await readResponseBody(res);
          throw new Error(getApiErrorMessage(body, "Failed to fetch requests"));
        }
        return res.json();
      });

      const [delegateResponse, applicationRequests] = await Promise.all([
        delegatePromise.catch(() => ({ data: [] })),
        listMyApplicationAccessRequests({ skipLoader: true }),
      ]);

      const delegateMapped: AccessRequestEntry[] = (delegateResponse.data || []).map(
        (item: {
          id: number;
          requesterName: string;
          departmentName: string;
          status: string;
          comments?: string;
          requestedAt: string;
          actionedAt?: string;
          actionedByName?: string;
        }) => {
          const status = item.status;
          return {
            id: `DELEGATE-${item.id}`,
            numericId: item.id,
            requesterName: item.requesterName,
            departmentName: item.departmentName,
            status,
            comments: item.comments || "",
            requestedAt: formatDateTime(item.requestedAt),
            actionedAt: formatDateTime(item.actionedAt),
            actionedByName:
              status === "APPROVED" || status === "REJECTED"
                ? item.actionedByName || "Unknown User"
                : "Awaiting approval",
            requestType: "DELEGATE" as const,
          };
        }
      );

      setRequestAccessEntries([
        ...applicationRequests.map(mapApplicationRequest),
        ...delegateMapped,
      ]);
    } catch (err) {
      setRequestsError(getErrorFromCatch(err, "Failed to load requests"));
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const loadApprovals = useCallback(async () => {
    setApprovalsLoading(true);
    setApprovalsError("");

    try {
      const departmentId = getDeptId();

      const delegatePromise = departmentId
        ? identityFetch(`/delegates/requests?departmentId=${departmentId}`, {
            headers: acceptJsonHeaders,
            skipLoader: true,
          }).then((res) => (res.ok ? res.json() : { data: [] }))
        : Promise.resolve({ data: [] });

      const [delegateResponse, applicationApprovals] = await Promise.all([
        delegatePromise,
        listMyApplicationAccessApprovals({ skipLoader: true }),
      ]);

      const delegateMapped: AccessRequestEntry[] = (delegateResponse.data || []).map(
        (item: {
          id: number;
          requesterName: string;
          departmentName: string;
          status: string;
          comments?: string;
          requestedAt: string;
        }) => ({
          id: `DELEGATE-${item.id}`,
          numericId: item.id,
          requesterName: item.requesterName,
          departmentName: item.departmentName,
          status: item.status,
          comments: item.comments || "",
          requestedAt: formatDateTime(item.requestedAt),
          actionedAt: "—",
          actionedByName: "",
          requestType: "DELEGATE" as const,
        })
      );

      setApprovalEntries([
        ...applicationApprovals.map(mapApplicationRequest),
        ...delegateMapped,
      ]);
    } catch (err) {
      setApprovalsError(getErrorFromCatch(err, "Failed to load approvals"));
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "requests") {
      void loadRequests();
    }
  }, [activeTab, loadRequests]);

  useEffect(() => {
    if (activeTab === "approvals") {
      void loadApprovals();
    }
  }, [activeTab, loadApprovals]);

  const handleDelegateAction = async (
    entry: AccessRequestEntry,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (entry.requestType !== "DELEGATE") return;

    try {
      setActionLoadingId(entry.id);

      const res = await identityFetch(`/delegates/${entry.numericId}/action`, {
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
      toast({
        title: "Action failed",
        description: getErrorFromCatch(err, "Action failed"),
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApplicationApprove = async (request: ApplicationAccessRequest) => {
    try {
      setActionLoadingId(`APPLICATION-${request.id}`);
      const updated = await approveApplicationAccessRequest(request.id, undefined, {
        skipLoader: true,
      });
      setApprovalEntries((prev) =>
        prev.map((entry) =>
          entry.id === `APPLICATION-${request.id}`
            ? mapApplicationRequest(updated)
            : entry
        )
      );
      setSelectedRequest(updated);
      setDetailsAllowActions(updated.status === "PENDING");
      toast({
        title: "Approved",
        description: "Application access request approved.",
      });
      await loadApprovals();
    } catch (err) {
      toast({
        title: "Action failed",
        description: getErrorFromCatch(err, "Failed to approve request"),
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApplicationReject = async (
    request: ApplicationAccessRequest,
    comments: string
  ) => {
    try {
      setActionLoadingId(`APPLICATION-${request.id}`);
      const updated = await rejectApplicationAccessRequest(request.id, comments, {
        skipLoader: true,
      });
      setApprovalEntries((prev) =>
        prev.filter((entry) => entry.id !== `APPLICATION-${request.id}`)
      );
      setSelectedRequest(updated);
      setDetailsAllowActions(false);
      toast({
        title: "Rejected",
        description: "Application access request rejected.",
      });
      await loadApprovals();
    } catch (err) {
      toast({
        title: "Action failed",
        description: getErrorFromCatch(err, "Failed to reject request"),
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const typeBadge = (type: RequestKind) => {
    if (type === "APPLICATION") return "bg-emerald-500/10 text-emerald-700";
    if (type === "COMPANY") return "bg-blue-500/10 text-blue-500";
    return "bg-purple-500/10 text-purple-500";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Requests & Approvals</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          <TabsTrigger value="approvals">My Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="relative overflow-x-auto rounded-lg border border-border">
            {requestsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Application / Details</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Actioned By</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!requestsLoading && requestAccessEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {requestsError || "No application access requests."}
                    </TableCell>
                  </TableRow>
                ) : (
                  requestAccessEntries.map((r) => {
                    const split = r.requestType === "APPLICATION"
                      ? splitApprovalAndProvisioning(r.status)
                      : null;
                    return (
                      <TableRow key={r.id}>
                        <TableCell>#{r.numericId}</TableCell>
                        <TableCell>
                          <Badge className={typeBadge(r.requestType)}>{r.requestType}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.requestType === "APPLICATION"
                            ? r.applicationsSummary
                            : r.departmentName || "—"}
                        </TableCell>
                        <TableCell>{r.approverName || r.actionedByName || "—"}</TableCell>
                        <TableCell>
                          {r.requestType === "APPLICATION" ? (
                            <div className="flex flex-col gap-1">
                              <ApplicationStatusBadge status={r.status} />
                              {split ? (
                                <span className="text-xs text-muted-foreground">
                                  Provisioning: {formatRequestStatus(split.provisioning) === "Pending Approval"
                                    ? "Not Started"
                                    : formatRequestStatus(split.provisioning)}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <ApplicationStatusBadge status={r.status} />
                          )}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {r.comments || "—"}
                        </TableCell>
                        <TableCell>{r.requestedAt}</TableCell>
                        <TableCell>{r.actionedByName}</TableCell>
                        <TableCell>
                          {r.applicationRequest ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setDetailsAllowActions(false);
                                setSelectedRequest(r.applicationRequest || null);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <div className="relative overflow-x-auto rounded-lg border border-border">
            {approvalsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Target User</TableHead>
                  <TableHead>Application / Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!approvalsLoading && approvalEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {approvalsError || "No application access requests."}
                    </TableCell>
                  </TableRow>
                ) : (
                  approvalEntries.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Badge className={typeBadge(r.requestType)}>{r.requestType}</Badge>
                      </TableCell>
                      <TableCell>{r.requesterName}</TableCell>
                      <TableCell>
                        {r.requestType === "APPLICATION"
                          ? r.targetUserName || "—"
                          : r.departmentName || "—"}
                      </TableCell>
                      <TableCell>
                        {r.requestType === "APPLICATION"
                          ? r.applicationsSummary
                          : r.departmentName || "—"}
                      </TableCell>
                      <TableCell>
                        <ApplicationStatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>{r.requestedAt}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {r.requestType === "APPLICATION" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setDetailsAllowActions(r.status === "PENDING");
                                  setSelectedRequest(r.applicationRequest || null);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  r.applicationRequest &&
                                  handleApplicationApprove(r.applicationRequest)
                                }
                                disabled={
                                  r.status !== "PENDING" || actionLoadingId === r.id
                                }
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setDetailsAllowActions(true);
                                  setSelectedRequest(r.applicationRequest || null);
                                }}
                                disabled={
                                  r.status !== "PENDING" || actionLoadingId === r.id
                                }
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleDelegateAction(r, "APPROVED")}
                                disabled={
                                  r.status !== "PENDING" || actionLoadingId === r.id
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
                                  r.status !== "PENDING" || actionLoadingId === r.id
                                }
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ApplicationAccessRequestDetailsDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null);
        }}
        allowActions={detailsAllowActions}
        actionLoading={actionLoadingId === (selectedRequest ? `APPLICATION-${selectedRequest.id}` : null)}
        onApprove={handleApplicationApprove}
        onReject={handleApplicationReject}
      />
    </div>
  );
};
