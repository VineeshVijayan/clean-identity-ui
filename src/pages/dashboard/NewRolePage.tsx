import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Save, Shield, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Permission categories and their permissions
const permissionCategories = [
  {
    category: "User Management",
    icon: Users,
    permissions: [
      { id: "user_view", name: "View Users", description: "Can view user list and details" },
      { id: "user_create", name: "Create Users", description: "Can create new users" },
      { id: "user_edit", name: "Edit Users", description: "Can edit user information" },
      { id: "user_delete", name: "Delete Users", description: "Can delete users" },
      { id: "user_export", name: "Export Users", description: "Can export user data" },
    ],
  },
  {
    category: "Role Management",
    icon: Shield,
    permissions: [
      { id: "role_view", name: "View Roles", description: "Can view role list and details" },
      { id: "role_create", name: "Create Roles", description: "Can create new roles" },
      { id: "role_edit", name: "Edit Roles", description: "Can edit role permissions" },
      { id: "role_delete", name: "Delete Roles", description: "Can delete roles" },
      { id: "role_assign", name: "Assign Roles", description: "Can assign roles to users" },
    ],
  },
  {
    category: "Application Access",
    icon: Key,
    permissions: [
      { id: "app_view", name: "View Applications", description: "Can view applications" },
      { id: "app_request", name: "Request Access", description: "Can request application access" },
      { id: "app_approve", name: "Approve Requests", description: "Can approve access requests" },
      { id: "app_revoke", name: "Revoke Access", description: "Can revoke application access" },
      { id: "app_manage", name: "Manage Applications", description: "Full application management" },
    ],
  },
];

export const NewRolePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleCategoryToggle = (categoryPermissions: { id: string }[]) => {
    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.includes(p.id)
    );

    if (allSelected) {
      setSelectedPermissions((prev) =>
        prev.filter((id) => !categoryPermissions.map((p) => p.id).includes(id))
      );
    } else {
      setSelectedPermissions((prev) => [
        ...prev,
        ...categoryPermissions.map((p) => p.id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleSaveRole = () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "At least one permission must be selected",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Role Created",
      description: `Role "${roleName}" has been created with ${selectedPermissions.length} permissions.`,
    });

    navigate("/roles/manage");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create New Role</h1>
            <p className="text-muted-foreground mt-1">
              Define a new role with specific permissions
            </p>
          </div>
        </div>
        <Button onClick={handleSaveRole} className="gap-2">
          <Save className="h-4 w-4" />
          Save Role
        </Button>
      </div>

      {/* Role Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Information
          </CardTitle>
          <CardDescription>Enter the basic details for the new role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name *</Label>
              <Input
                id="roleName"
                placeholder="e.g., Content Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Selected Permissions</Label>
              <div className="h-10 px-3 rounded-lg border bg-muted/50 flex items-center">
                <Badge variant="secondary">{selectedPermissions.length} permissions</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              placeholder="Describe the role's responsibilities and scope..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Permissions
          </CardTitle>
          <CardDescription>Select the permissions for this role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permissionCategories.map((category, index) => {
            const CategoryIcon = category.icon;
            const allSelected = category.permissions.every((p) =>
              selectedPermissions.includes(p.id)
            );
            const someSelected = category.permissions.some((p) =>
              selectedPermissions.includes(p.id)
            );

            return (
              <div key={category.category}>
                {index > 0 && <Separator className="mb-6" />}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{category.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          {category.permissions.filter((p) =>
                            selectedPermissions.includes(p.id)
                          ).length}{" "}
                          of {category.permissions.length} selected
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={allSelected ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryToggle(category.permissions)}
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pl-11">
                    {category.permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedPermissions.includes(permission.id)
                            ? "bg-primary/5 border-primary/30"
                            : "hover:bg-muted/50"
                          }`}
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => handlePermissionToggle(permission.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-sm">{permission.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};
