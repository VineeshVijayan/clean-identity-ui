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
import { useState } from "react";
import { toast } from "sonner";

type AccessRequest = {
  id: string;
  requesterName: string;
  departmentName: string;
  status: string;
  comments: string;
  requestedAt: string;
};

const sampleRequests: AccessRequest[] = [
  {
    id: "1",
    requesterName: "John Smith",
    departmentName: "Engineering",
    status: "Pending",
    comments: "Need access for project collaboration",
    requestedAt: "2026-04-10 09:30 AM",
  },
  {
    id: "2",
    requesterName: "Sarah Johnson",
    departmentName: "Marketing",
    status: "Pending",
    comments: "Cross-team initiative support",
    requestedAt: "2026-04-09 02:15 PM",
  },
  {
    id: "3",
    requesterName: "Mike Davis",
    departmentName: "Finance",
    status: "Pending",
    comments: "Budget review assistance",
    requestedAt: "2026-04-08 11:00 AM",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "Rejected":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "Pending":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const MyApprovalPage = () => {
  const [requests, setRequests] = useState<AccessRequest[]>(sampleRequests);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
    toast.success("Request approved successfully");
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
    toast.success("Request rejected successfully");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
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
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.requesterName}
                </TableCell>
                <TableCell>{request.departmentName}</TableCell>
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
                  {request.requestedAt}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => handleApprove(request.id)}
                      disabled={request.status !== "Pending"}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => handleReject(request.id)}
                      disabled={request.status !== "Pending"}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
