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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Building2, Edit, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  location: string;
  phoneNumber: string;
  primaryContact: string;
}

const initialCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Corporation",
    location: "New York, USA",
    phoneNumber: "+1 555-0100",
    primaryContact: "John Smith",
  },
  {
    id: "2",
    name: "Globex Industries",
    location: "London, UK",
    phoneNumber: "+44 20 7946 0958",
    primaryContact: "Emma Watson",
  },
  {
    id: "3",
    name: "Initech Solutions",
    location: "Bangalore, India",
    phoneNumber: "+91 80 4123 4567",
    primaryContact: "Raj Patel",
  },
];

export const ManageCompanyPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);

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

  const handleEdit = (company: Company) => {
    setEditing({ ...company });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    setCompanies((prev) => prev.map((c) => (c.id === editing.id ? editing : c)));
    setEditOpen(false);
    toast.success("Company updated successfully");
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.location}</TableCell>
                      <TableCell>{company.phoneNumber}</TableCell>
                      <TableCell>{company.primaryContact}</TableCell>
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
                  ))
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
