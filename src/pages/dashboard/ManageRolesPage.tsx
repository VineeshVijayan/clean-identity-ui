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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FolderOpen,
  Plus,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";

type Role = {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissionCount: number;
  type: "system" | "custom";
  createdDate: string;
  lastModified: string;
};

// Mock applications for the blueprint
const mockBlueprintApps = [
  { id: "salesforce", name: "Salesforce CRM", category: "CRM", icon: "💼", accessLevel: "Full Access", grantedDate: "2023-06-15", essential: false },
  { id: "jira", name: "Jira", category: "Project Management", icon: "📋", accessLevel: "Standard", grantedDate: "2023-08-20", essential: true },
  { id: "slack", name: "Slack Enterprise", category: "Communication", icon: "💬", accessLevel: "Full Access", grantedDate: "2025-01-10", essential: true },
  { id: "tableau", name: "Tableau", category: "Analytics", icon: "📊", accessLevel: "Read Only", grantedDate: "2025-11-05", essential: false },
  { id: "github", name: "GitHub Enterprise", category: "Development", icon: "🐙", accessLevel: "Contributor", grantedDate: "2023-03-22", essential: true },
  { id: "confluence", name: "Confluence", category: "Documentation", icon: "📝", accessLevel: "Standard", grantedDate: "2023-04-18", essential: false },
];

const availableAppsToAdd = [
  { id: "okta", name: "Okta", category: "Identity", icon: "🔐" },
  { id: "zoom", name: "Zoom", category: "Communication", icon: "📹" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", icon: "💜" },
  { id: "aws", name: "AWS Console", category: "Cloud", icon: "☁️" },
];

type BlueprintApp = {
  id: string;
  name: string;
  category: string;
  icon: string;
  accessLevel: string;
  grantedDate: string;
  essential: boolean;
};

export const ManageRolesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [selectedAppToAdd, setSelectedAppToAdd] = useState("");
  const [blueprintApps, setBlueprintApps] = useState<BlueprintApp[]>(mockBlueprintApps);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);

  /* ================= FETCH ROLES ================= */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/roles`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch roles");

        const response = await res.json();
        const rolesArray = Array.isArray(response)
          ? response
          : response.data || [];

        const mappedRoles: Role[] = rolesArray.map((r: any) => ({
          id: r.id,
          name: r.name,
          description: r.description || "—",
          userCount: r.userCount || 0,
          permissionCount: r.permissionCount || 0,
          type: r.system ? "system" : "custom",
          createdDate: r.createdDate || "—",
          lastModified: r.updatedAt || r.createdDate || "—",
        }));

        setRoles(mappedRoles);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load roles",
          variant: "destructive",
        });
      }
    };

    fetchRoles();
  }, [toast]);

  /* ================= DELETE ================= */
  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;

    try {
      const token = localStorage.getItem("auth-token");

      const res = await fetch(`${API_BASE_URL}/roles/${deleteRoleId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setRoles((prev) => prev.filter((r) => r.id !== deleteRoleId));

      toast({
        title: "Role Deleted",
        description: "The role has been deleted successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    } finally {
      setDeleteRoleId(null);
    }
  };

  const handleAddApp = () => {
    if (!selectedAppToAdd) return;
    const app = availableAppsToAdd.find((a) => a.id === selectedAppToAdd);
    if (!app || blueprintApps.find((a) => a.id === app.id)) return;
    setBlueprintApps((prev) => [
      ...prev,
      {
        ...app,
        accessLevel: "Standard",
        grantedDate: new Date().toISOString().split("T")[0],
        essential: false,
      },
    ]);
    setSelectedAppToAdd("");
  };

  const handleRemoveApp = (id: string) => {
    const app = blueprintApps.find((a) => a.id === id);
    if (app?.essential) return;
    setBlueprintApps((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateBlueprint = () => {
    toast({
      title: "Blueprint Updated",
      description: `Blueprint has been updated with ${blueprintApps.length} applications.`,
    });
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
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Blueprints</h1>
          <p className="text-muted-foreground mt-1">
            View and edit existing Blueprints
          </p>
        </div>
        <Button
          onClick={() => navigate("/roles/new")}
          className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          New Blueprint
        </Button>
      </div>

      {/* Step 1: Select Blueprint */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
            1
          </span>
          <h2 className="text-lg font-semibold">Select Blueprint</h2>
        </div>
        <div className="relative">
          <Select value={selectedBlueprintId} onValueChange={setSelectedBlueprintId}>
            <SelectTrigger className="w-full h-12 pl-10">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Choose an application..." />
            </SelectTrigger>
            <SelectContent>
              {roles.length > 0 ? (
                roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="default-blueprint" >
                  Default Blueprint
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blueprint Application List - Step 2 */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Blueprint Application List</h2>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
              2
            </span>
            <h3 className="text-lg font-semibold">Add Application(s)</h3>
          </div>
          <div className="relative">
            <Select value={selectedAppToAdd} onValueChange={(val) => {
              setSelectedAppToAdd(val);
              // Auto-add on select
              const app = availableAppsToAdd.find((a) => a.id === val);
              if (app && !blueprintApps.find((a) => a.id === app.id)) {
                setBlueprintApps((prev) => [
                  ...prev,
                  {
                    ...app,
                    accessLevel: "Standard",
                    grantedDate: new Date().toISOString().split("T")[0],
                    essential: false,
                  },
                ]);
                setSelectedAppToAdd("");
              }
            }}>
              <SelectTrigger className="w-full h-12 pl-10">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Choose an application(s) to add to Blueprint..." />
              </SelectTrigger>
              <SelectContent>
                {availableAppsToAdd
                  .filter((app) => !blueprintApps.find((a) => a.id === app.id))
                  .map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      <span className="flex items-center gap-2">
                        <span>{app.icon}</span>
                        <span>{app.name}</span>
                        <span className="text-muted-foreground text-xs">— {app.category}</span>
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* My Current Applications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">My Current Applications</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blueprintApps.map((app) => (
            <div
              key={app.id}
              className="relative rounded-xl border border-border bg-card p-5 space-y-3 transition-shadow hover:shadow-md"
            >
              {/* Remove / Essential icon */}
              <div className="absolute top-3 right-3">
                {app.essential ? (
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <button
                    onClick={() => handleRemoveApp(app.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* App info */}
              <div className="flex items-center gap-3">
                <div className="text-2xl">{app.icon}</div>
                <div>
                  <p className="font-semibold text-sm">{app.name}</p>
                  <p className="text-xs text-muted-foreground">{app.category}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Access Level:</span>
                  <Badge variant="outline" className="text-xs font-medium">
                    {app.accessLevel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Granted:</span>
                  <span className="text-xs">{app.grantedDate}</span>
                </div>
              </div>

              {/* Status */}
              <div className="pt-1">
                {app.essential ? (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground border border-border rounded-full py-1.5 px-3">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Essential — Cannot Remove
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 border border-green-200 bg-green-50 rounded-full py-1.5 px-3">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active Access
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Blueprint Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpdateBlueprint}
          className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" />
          Update Blueprint
        </Button>
      </div>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteRoleId !== null}
        onOpenChange={() => setDeleteRoleId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be
              undone.
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
