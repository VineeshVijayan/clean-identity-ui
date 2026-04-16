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
};

export const ApplicationManagementPage = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("request");

  // ✅ EXISTING STATE (KEPT SAME)
  const [requestAccessEntries, setRequestAccessEntries] = useState<AccessRequestEntry[]>([
    {
      id: "1",
      requesterName: "John Smith",
      departmentName: "Engineering",
      status: "Pending",
      comments: "Need Salesforce access",
      requestedAt: "2026-04-10 09:30 AM",
    },
  ]);

  // ✅ NEW API INTEGRATION
  useEffect(() => {
    fetch(`${API_BASE_URL}/delegates/my-requests`, {
      headers: authHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requests");
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

        setRequestAccessEntries(mapped);
      })
      .catch((err) => console.error(err));
  }, []);

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
      <h1 className="text-2xl font-bold">Manage Team Access</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="request">Request Access</TabsTrigger>
          <TabsTrigger value="remove">Remove Access</TabsTrigger>
        </TabsList>

        {/* REQUEST TAB */}
        <TabsContent value="request">
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
              {requestAccessEntries.map((r) => (
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
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectRequest(r.id)}
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