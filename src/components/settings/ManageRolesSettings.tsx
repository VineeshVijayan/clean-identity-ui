import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

interface Role {
  id: string;
  name: string;
  description: string;
}

export const ManageRolesSettings = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  /* ---------------- FETCH ROLES ---------------- */

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const token = localStorage.getItem("auth-token");

    try {
      const res = await fetch(`${API_BASE_URL}/roles`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : data?.data || data?.roles || [];

      const mapped: Role[] = list.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || "",
      }));

      setRoles(mapped);

    } catch {
      toast.error("Failed to load roles");
    }
  };

  /* ---------------- CREATE ROLE ---------------- */

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    const token = localStorage.getItem("auth-token");

    try {
      const res = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: newRole.name.trim(),
          description: newRole.description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to create role");
      }

      const createdRole: Role = {
        id: data?.id || String(Date.now()),
        name: data?.name || newRole.name,
        description: data?.description || newRole.description,
      };

      setRoles((prev) => [...prev, createdRole]);

      setNewRole({ name: "", description: "" });
      setIsDialogOpen(false);

      toast.success("Role created successfully", {
        description: `"${createdRole.name}" has been added.`,
      });

    } catch (error: any) {
      toast.error(error.message || "Failed to create role");
    }
  };

  /* ---------------- DELETE ROLE ---------------- */

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;

    const token = localStorage.getItem("auth-token");

    try {
      const res = await fetch(`${API_BASE_URL}/roles/${deleteRoleId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error();

      setRoles((prev) => prev.filter((r) => r.id !== deleteRoleId));

      toast.success("Role deleted successfully");

    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleteRoleId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Roles</h3>
          <p className="text-sm text-muted-foreground">
            Manage application roles and permissions
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      {role.name}
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {role.description}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteRoleId(role.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Add a new role to the system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                placeholder="e.g. Editor"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g. Can edit content"
                value={newRole.description}
                onChange={(e) =>
                  setNewRole((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button onClick={handleCreateRole}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteRoleId(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDeleteRole}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};