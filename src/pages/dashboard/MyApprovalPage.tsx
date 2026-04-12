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
import { motion } from "framer-motion";
import { CheckCircle, ClipboardList, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type AccessRequest = {
  id: number;
  requesterName: string;
  departmentName: string;
  status: string;
  comments: string;
  requestedAt: string;
};

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

// ✅ Auth Header
const authHeaders = () => {
  const token = localStorage.getItem("auth-token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

// ✅ Get departmentId from token
const getDepartmentIdFromToken = () => {
  const token = localStorage.getItem("auth-token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.departmentId; // ⚠️ change if key different
  } catch (error) {
    console.error("Invalid token");
    return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "APPROVED":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "PENDING":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const MyApprovalPage = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ✅ GET API
  const fetchRequests = async () => {
    try {
      setLoading(true);

      const departmentId = getDepartmentIdFromToken();

      if (!departmentId) {
        toast.error("Department not found in token");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/delegates/requests?departmentId=${departmentId}`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setRequests(data.data || []);
      } else {
        throw new Error(data?.error || "Failed");
      }
    } catch (error) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ POST API (Approve / Reject)
  const handleAction = async (
    id: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setActionLoadingId(id);

      const res = await fetch(
        `${API_BASE_URL}/delegates/${id}/action`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            status,
            comments:
              status === "APPROVED"
                ? "Approved for reporting access"
                : "Request rejected",
          }),
        }
      );

      if (!res.ok) throw new Error("Action failed");

      // ✅ Update UI instantly
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status } : r
        )
      );

      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <ClipboardList className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage incoming access requests
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester Name</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Comments
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                Requested At
              </TableHead>
              <TableHead className="text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.requesterName}
                  </TableCell>

                  <TableCell>
                    {request.departmentName}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(request.status)}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                    {request.comments}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(request.requestedAt).toLocaleString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Approve */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                        onClick={() =>
                          handleAction(request.id, "APPROVED")
                        }
                        disabled={
                          request.status !== "PENDING" ||
                          actionLoadingId === request.id
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {actionLoadingId === request.id
                          ? "Processing..."
                          : "Approve"}
                      </Button>

                      {/* Reject */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() =>
                          handleAction(request.id, "REJECTED")
                        }
                        disabled={
                          request.status !== "PENDING" ||
                          actionLoadingId === request.id
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {actionLoadingId === request.id
                          ? "Processing..."
                          : "Reject"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};