import { Badge } from "@/components/ui/badge";
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
  status: "Active" | "Inactive";
}

export const ManageRolesSettings = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });

  /* ---------------- FETCH ROLES ---------------- */

  useEffect(() => {
    const token = localStorage.getItem("auth-token");

    fetch(`${API_BASE_URL}/roles`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.roles || [];

        const mapped: Role[] = list.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || ""
            ? r.createdAt.split("T")[0]
            : "",
          status: r.status || "Active",
        }));

        setRoles(mapped);
      })
      .catch(() => {
        toast.error("Failed to load roles");
      });
  }, []);

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

      // Map API response safely
      const createdRole: Role = {
        id: data?.id || String(Date.now()),
        name: data?.name || newRole.name,
        description: data?.description || newRole.description,
        status: data?.status || "Active",
      };

      // Update UI instantly
      setRoles((prev) => [...prev, createdRole]);

      // Reset form
      setNewRole({ name: "", description: "" });
      setIsDialogOpen(false);

      toast.success("Role created successfully", {
        description: `"${createdRole.name}" has been added.`,
      });

    } catch (error: any) {
      toast.error(error.message || "Failed to create role");
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
              <TableHead className="text-center">Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
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
                    <Badge
                      variant={
                        role.status === "Active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {role.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
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
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
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
              <Label htmlFor="role-desc">Description</Label>
              <Input
                id="role-desc"
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
    </div>
  );
};