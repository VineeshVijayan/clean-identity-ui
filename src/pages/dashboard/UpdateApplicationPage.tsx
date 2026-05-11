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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { AppWindow, Edit, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Application {
  id: string;
  name: string;
  connectedApp: string;
  essential: boolean;
  owner: string;
}

const INITIAL: Application[] = [
  { id: "1", name: "HR Portal", connectedApp: "Okta", essential: true, owner: "Jane Doe" },
  { id: "2", name: "Sales CRM", connectedApp: "Salesforce", essential: false, owner: "John Smith" },
  { id: "3", name: "Dev Tools", connectedApp: "GitHub", essential: false, owner: "Alex Lee" },
];

export const UpdateApplicationPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>(INITIAL);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return applications;
    return applications.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.connectedApp.toLowerCase().includes(q) ||
        a.owner.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const handleEdit = (app: Application) => {
    setEditing({ ...app });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    setApplications((prev) =>
      prev.map((a) => (a.id === editing.id ? editing : a))
    );
    setEditOpen(false);
    toast.success("Application updated successfully");
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
            <AppWindow className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Update Applications</h1>
            <p className="text-muted-foreground">View and edit application details</p>
          </div>
        </div>
        <Button onClick={() => navigate("/applications/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application Name</TableHead>
                  <TableHead>Connected Application</TableHead>
                  <TableHead>Essential</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.connectedApp}</TableCell>
                      <TableCell>
                        <span
                          className={
                            app.essential
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {app.essential ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell>{app.owner}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(app)}
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
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Application Name</Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-connected">Connected Application</Label>
                <Input
                  id="edit-connected"
                  value={editing.connectedApp}
                  onChange={(e) =>
                    setEditing({ ...editing, connectedApp: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-owner">Owner</Label>
                <Input
                  id="edit-owner"
                  value={editing.owner}
                  onChange={(e) => setEditing({ ...editing, owner: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="edit-essential" className="text-base">
                    Essential
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add to Essential Blueprint
                  </p>
                </div>
                <Switch
                  id="edit-essential"
                  checked={editing.essential}
                  onCheckedChange={(v) => setEditing({ ...editing, essential: v })}
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
