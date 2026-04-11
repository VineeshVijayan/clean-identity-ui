import { useState } from "react";
import { Plus, Shield, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  createdAt: string;
  status: "Active" | "Inactive";
}

const initialRoles: Role[] = [
  { id: "1", name: "Super Admin", description: "Full system access", usersCount: 2, createdAt: "2024-01-15", status: "Active" },
  { id: "2", name: "Admin", description: "Administrative access", usersCount: 5, createdAt: "2024-02-10", status: "Active" },
  { id: "3", name: "Manager", description: "Team management access", usersCount: 12, createdAt: "2024-03-05", status: "Active" },
  { id: "4", name: "User", description: "Standard user access", usersCount: 45, createdAt: "2024-03-20", status: "Active" },
  { id: "5", name: "Viewer", description: "Read-only access", usersCount: 8, createdAt: "2024-04-01", status: "Inactive" },
];

export const ManageRolesSettings = () => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    const role: Role = {
      id: String(Date.now()),
      name: newRole.name.trim(),
      description: newRole.description.trim(),
      usersCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    setRoles((prev) => [...prev, role]);
    setNewRole({ name: "", description: "" });
    setIsDialogOpen(false);
    toast.success("Role created successfully", {
      description: `"${role.name}" has been added.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Roles</h3>
          <p className="text-sm text-muted-foreground">Manage application roles and permissions</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {role.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{role.description}</TableCell>
                <TableCell className="text-center">{role.usersCount}</TableCell>
                <TableCell className="text-muted-foreground">{role.createdAt}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={role.status === "Active" ? "default" : "secondary"}>
                    {role.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Add a new role to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g. Editor"
                value={newRole.name}
                onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
                placeholder="e.g. Can edit content"
                value={newRole.description}
                onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
