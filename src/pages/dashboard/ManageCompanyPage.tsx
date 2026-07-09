import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Building2, ChevronLeft, ChevronRight, Edit, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";


interface Company {
  id: string;
  name: string;
  location: string;
  phoneNumber: string;
  primaryContact: string;
  approverId: number;
  isEnabled: boolean;
}

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export const ManageCompanyPage = () => {
  const API_BASE_URL = "https://identity-api.ndashdigital.com/api";
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.primaryContact.toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q)
    );
  }, [companies, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handleEdit = (company: Company) => {
    setEditing({ ...company });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const token = localStorage.getItem("auth-token");

      await fetch(`${API_BASE_URL}/companies/${editing.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: editing.name,
          location: editing.location,
          phoneNumber: editing.phoneNumber,
          approverId: editing.approverId,
          contact: {
            firstName: editing.primaryContact.split(" ")[0],
            lastName: editing.primaryContact.split(" ")[1] || "",
          },
        }),
      });

      // update UI
      setCompanies((prev) =>
        prev.map((c) => (c.id === editing.id ? editing : c))
      );

      setEditOpen(false);
      toast.success("Company updated successfully");

    } catch (err) {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/companies`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await res.json();

        const list = data.data || data;

        const mapped = list.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          location: c.location,
          phoneNumber: c.phoneNumber,
          primaryContact: c.contactName || "",
          approverId: c.approverId,
          isEnabled: c.enabled,
        }));

        setCompanies(mapped);
        setStatusMap(
          Object.fromEntries(
            mapped.map((c) => [c.id, c.enabled])
          )
        );

      } catch (err) {
        console.error("Failed to load companies", err);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/users/managers`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        const list = data.data || data;

        setApprovers(list);
      } catch (err) {
        console.error("Failed to load approvers", err);
      }
    };

    fetchApprovers();
  }, []);

  const toggleStatus = async (company: Company) => {

    const newStatus = !(statusMap[company.id] ?? company.isEnabled);
  
    try {
  
      const token = localStorage.getItem("auth-token");
  
      const response = await fetch(
        `${API_BASE_URL}/companies/${company.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            name: company.name,
            location: company.location,
            phoneNumber: company.phoneNumber,
            approverId: company.approverId,
            isEnabled: newStatus,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error();
      }
  
      setStatusMap((prev) => ({
        ...prev,
        [company.id]: newStatus,
      }));
  
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === company.id
            ? { ...c, isEnabled: newStatus }
            : c
        )
      );
  
      toast.success(
        `Company ${newStatus ? "activated" : "deactivated"} successfully`
      );
  
    } catch {
  
      toast.error("Failed to update company status");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Manage Companies</h1>
            <p className="text-muted-foreground">View and edit company details</p>
          </div>
        </div>
        <Button onClick={() => navigate("/company/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((company) => {
                    const isActive = statusMap[company.id] ?? company.isEnabled;
                    return (
                      <TableRow
                        key={company.id}
                        className={`transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-50"}`}
                      >
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.location}</TableCell>
                        <TableCell>{company.phoneNumber}</TableCell>
                        <TableCell>{company.primaryContact}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={isActive}
                              onCheckedChange={() => toggleStatus(company)}
                              aria-label={`Toggle status for ${company.name}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(company)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Company Name</Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editing.phoneNumber}
                  onChange={(e) => setEditing({ ...editing, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contact">Primary Contact</Label>
                <Input
                  id="edit-contact"
                  value={editing.primaryContact}
                  onChange={(e) => setEditing({ ...editing, primaryContact: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Approver</Label>

                <Select
                  value={String(editing.approverId)}
                  onValueChange={(value) =>
                    setEditing({
                      ...editing,
                      approverId: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>

                  <SelectContent>
                    {approvers.map((approver) => (
                      <SelectItem
                        key={approver.id}
                        value={String(approver.id)}
                      >
                        {approver.firstName} {approver.lastName} ({approver.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
