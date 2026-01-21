import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Shield,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
  Copy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// Mock roles data
const mockRoles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    userCount: 3,
    permissionCount: 25,
    type: "system",
    createdDate: "2023-01-01",
    lastModified: "2024-01-15",
  },
  {
    id: 2,
    name: "Admin",
    description: "Administrative access without system settings",
    userCount: 8,
    permissionCount: 18,
    type: "system",
    createdDate: "2023-01-01",
    lastModified: "2024-01-10",
  },
  {
    id: 3,
    name: "Manager",
    description: "Team and user management capabilities",
    userCount: 15,
    permissionCount: 12,
    type: "custom",
    createdDate: "2023-03-15",
    lastModified: "2024-01-08",
  },
  {
    id: 4,
    name: "Content Editor",
    description: "Content creation and editing permissions",
    userCount: 25,
    permissionCount: 8,
    type: "custom",
    createdDate: "2023-05-20",
    lastModified: "2023-12-22",
  },
  {
    id: 5,
    name: "Viewer",
    description: "Read-only access to resources",
    userCount: 50,
    permissionCount: 5,
    type: "system",
    createdDate: "2023-01-01",
    lastModified: "2023-11-30",
  },
  {
    id: 6,
    name: "Support Agent",
    description: "Customer support and ticket management",
    userCount: 12,
    permissionCount: 10,
    type: "custom",
    createdDate: "2023-07-10",
    lastModified: "2024-01-05",
  },
];

export const ManageRolesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);

  const filteredRoles = mockRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRole = () => {
    const role = mockRoles.find((r) => r.id === deleteRoleId);
    toast({
      title: "Role Deleted",
      description: `Role "${role?.name}" has been deleted.`,
    });
    setDeleteRoleId(null);
  };

  const handleDuplicateRole = (role: typeof mockRoles[0]) => {
    toast({
      title: "Role Duplicated",
      description: `A copy of "${role.name}" has been created as "${role.name} (Copy)".`,
    });
  };

  const getRoleTypeBadge = (type: string) => {
    if (type === "system") {
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          System
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
        Custom
      </Badge>
    );
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Roles</h1>
          <p className="text-muted-foreground mt-1">
            View, edit, and manage system and custom roles
          </p>
        </div>
        <Button onClick={() => navigate("/roles/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{mockRoles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">
                  {mockRoles.filter((r) => r.type === "system").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users with Roles</p>
                <p className="text-2xl font-bold">
                  {mockRoles.reduce((sum, r) => sum + r.userCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>Manage permissions and access control for your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Users</TableHead>
                  <TableHead className="hidden lg:table-cell">Permissions</TableHead>
                  <TableHead className="hidden xl:table-cell">Modified</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {role.description}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {getRoleTypeBadge(role.type)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary">{role.userCount} users</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{role.permissionCount}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {role.lastModified}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => handleDuplicateRole(role)}
                          >
                            <Copy className="h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => setDeleteRoleId(role.id)}
                            disabled={role.type === "system"}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Role
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteRoleId !== null} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              Users assigned to this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
