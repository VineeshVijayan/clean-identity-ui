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

    if (approvalEntries.length > 0) return;

    const departmentId = getDeptId();

    if (!departmentId) {
      console.error("No departmentId found in token");
      return;
    }

    fetch(`${API_BASE_URL}/delegates/requests?departmentId=${departmentId}`, {
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch approvals");
        return res.json();
      })
      .then((response) => {
        const mapped = response.data.map((item: any) => ({
          id: String(item.id),
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
        }));

        setApprovalEntries(mapped);
      })
      .catch((err) => console.error(err));
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

  const handleApproveRequest = (id: string) => {
    setRequestAccessEntries((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Approved" } : r
      )
    );
    toast({ title: "Approved" });
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
                <TableHead>Actions</TableHead>
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
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(r.id)}
                      disabled={r.status == "Pending"}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="approvals">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {approvalEntries.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.requesterName}</TableCell>
                  <TableCell>{r.departmentName}</TableCell>
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