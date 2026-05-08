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
  X
} from "lucide-react";
import { useEffect, useState } from "react";

const authHeaders = () => {
  const token = localStorage.getItem("auth-token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

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

  const [activeTab, setActiveTab] = useState("requests");

  // ✅ EXISTING STATE (KEPT SAME)
  const [requestAccessEntries, setRequestAccessEntries] = useState<AccessRequestEntry[]>([]);
  const [approvalEntries, setApprovalEntries] = useState<AccessRequestEntry[]>([]);

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
      try {
        const res = await fetch(`${API_BASE_URL}/delegates/my-requests`, {
          headers: authHeaders(),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch requests");
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
      }
    };

    loadRequests();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "approvals") return;

    const loadApprovals = async () => {
      try {
        const departmentId = getDeptId();

        // Existing delegate approvals
        const delegatePromise = departmentId
          ? fetch(`${API_BASE_URL}/delegates/requests?departmentId=${departmentId}`, {
            headers: authHeaders(),
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

  const handleApproveRequest = async (id: string) => {
    try {
      const [type, actualId] = id.split("-");

      let res;

      // Delegate approval
      if (type === "DELEGATE") {
        res = await fetch(
          `${API_BASE_URL}/delegates/requests/${actualId}/approve`,
          {
            method: "PUT",
            headers: authHeaders(),
          }
        );
      }

      if (!res || !res.ok) {
        throw new Error("Approval failed");
      }

      // Remove row after approval
      setApprovalEntries((prev) =>
        prev.filter((r) => r.id !== id)
      );

      toast({
        title: "Approved",
        description:
          type === "COMPANY"
            ? "Company approved successfully"
            : "Delegate request approved successfully",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Approval failed",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = (id: string) => {
    setRequestAccessEntries((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Rejected" } : r
      )
    );
    toast({ title: "Rejected" });
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
              {requestAccessEntries.map((r) => (
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
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="approvals">
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
              {approvalEntries.map((r) => (
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
                      onClick={() => handleApproveRequest(r.id)}
                      disabled={r.status !== "Pending"}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectRequest(r.id)}
                      disabled={r.status !== "Pending"}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

    </div>
  );
};