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
  Plus,
  User,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "https://identity-api.ndashdigital.com/api";
const CONNECTOR_API_BASE_URL =
  "https://idf-connector.ndashdigital.com/api";

type Role = {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissionCount: number;
  type: "system" | "custom";
  createdDate: string;
  lastModified: string;
  applications: any[];
  jobTitles: any[];
};

type BlueprintApp = {
  id: string;
  name: string;
  category: string;
  icon: string;
  accessLevel: string;
  grantedDate: string;
  essential: boolean;
  project?: string;
};

export const ManageRolesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [availableAppsToAdd, setAvailableAppsToAdd] = useState<any[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState("");
  const [blueprintSearch, setBlueprintSearch] = useState("");
  const [blueprintDropdownOpen, setBlueprintDropdownOpen] = useState(false);

  const blueprintDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedAppToAdd, setSelectedAppToAdd] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  const [hasAddedApp, setHasAddedApp] = useState(false);
  const [blueprintApps, setBlueprintApps] = useState<BlueprintApp[]>([]);
  const [deleteRoleId, setDeleteRoleId] = useState<number | null>(null);

  const filteredBlueprints = roles.filter((role) =>
    role.name.toLowerCase().includes(blueprintSearch.toLowerCase())
  );

  const visibleBlueprints =
    blueprintSearch.trim() === ""
      ? filteredBlueprints.slice(0, 8)
      : filteredBlueprints;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        blueprintDropdownRef.current &&
        !blueprintDropdownRef.current.contains(e.target as Node)
      ) {
        setBlueprintDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  /* ================= FETCH BLUEPRINTS ================= */

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/blueprints`, {
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
          jobTitles: r.jobTitles,
          applications: r.applications || [],
        }));

        setRoles(mappedRoles);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load blueprints",
          variant: "destructive",
        });
      }
    };

    fetchRoles();
  }, [toast]);

  /* ================= FETCH APPLICATIONS ================= */

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("auth-token");

        const res = await fetch(`${API_BASE_URL}/applications`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch applications");

        const response = await res.json();

        const appsArray = Array.isArray(response)
          ? response
          : response.data.content || [];

        const mappedApps = appsArray.map((app: any) => ({
          id: app.id || app.appId,
          name: app.name || app.appName,
          category: app.category || "General",
          icon: app.icon || "📦",
          integrationName: app.integrationName,
        }));

        setAvailableAppsToAdd(mappedApps);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        });
      }
    };

    fetchApplications();
  }, [toast]);

  /* ================= INTEGRATION BASE ================= */

  const getIntegrationApiBase = (applicationId: string) => {
    const selectedApp = availableAppsToAdd.find(
      (app) => String(app.id) === String(applicationId)
    );

    if (!selectedApp?.integrationName) return null;

    return `${CONNECTOR_API_BASE_URL}/integrations/${selectedApp.integrationName.toLowerCase()}`;
  };

  /* ================= FETCH PROJECTS + ROLES ================= */

  useEffect(() => {
    if (!selectedAppToAdd) return;

    const integrationBase = getIntegrationApiBase(selectedAppToAdd);

    if (!integrationBase) return;

    const token = localStorage.getItem("auth-token");

    const fetchIntegrationData = async () => {
      try {
        const [rolesRes, projectsRes] = await Promise.all([
          fetch(`${integrationBase}/roles`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }),

          fetch(`${integrationBase}/projects`, {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
          }),
        ]);

        const rolesData = await rolesRes.json();

        setAvailableRoles(rolesData || []);
      } catch (error) {
        console.error("Failed to fetch integration data", error);
      }
    };

    fetchIntegrationData();
  }, [selectedAppToAdd]);

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

  /* ================= ADD APP ================= */

  const handleAddApp = () => {
    if (
      !selectedAppToAdd ||
      !selectedRole ||
      !selectedProject ||
      !selectedBlueprintId
    )
      return;

    const app = availableAppsToAdd.find(
      (a) => String(a.id) === String(selectedAppToAdd)
    );

    if (!app) return;

    if (!blueprintApps.find((a) => a.id === app.id)) {
      setBlueprintApps((prev) => [
        ...prev,
        {
          ...app,
          accessLevel: selectedRole,
          project: selectedProject,
          grantedDate: new Date().toISOString().split("T")[0],
          essential: false,
        },
      ]);
    }

    setSelectedAppToAdd("");
    setSelectedRole("");
    setSelectedProject("");
    setHasAddedApp(true);
  };

  const handleRemoveApp = (id: string) => {
    const app = blueprintApps.find((a) => a.id === id);

    if (app?.essential) return;

    setBlueprintApps((prev) => prev.filter((a) => a.id !== id));
  };

  /* ================= UPDATE ================= */

  const handleUpdateBlueprint = async () => {
    if (!selectedBlueprintId) {
      toast({
        title: "Error",
        description: "Please select a blueprint",
        variant: "destructive",
      });

      return;
    }

    if (blueprintApps.length === 0) {
      toast({
        title: "Error",
        description: "At least one application is required",
        variant: "destructive",
      });

      return;
    }

    try {
      const token = localStorage.getItem("auth-token");

      const selected = roles.find(
        (r) => String(r.id) === selectedBlueprintId
      );

      const payload = {
        name: selected?.name || "",
        jobTitleIds: selected?.jobTitles?.map((jt: any) => jt.id) || [],
        applicationIds: blueprintApps.map((app) => Number(app.id)),
      };

      const res = await fetch(
        `${API_BASE_URL}/blueprints/${selectedBlueprintId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Update failed");

      toast({
        title: "Success",
        description: "Blueprint updated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update blueprint",
        variant: "destructive",
      });
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold">
            Manage Blueprints
          </h1>

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

      {/* Select Blueprint */}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
            1
          </span>

          <h2 className="text-lg font-semibold">Select Blueprint</h2>
        </div>

        <div className="relative">
          <div ref={blueprintDropdownRef} className="relative">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <input
                type="text"
                value={
                  blueprintDropdownOpen
                    ? blueprintSearch
                    : roles.find(
                      (r) => String(r.id) === selectedBlueprintId
                    )?.name || blueprintSearch
                }
                onChange={(e) => {
                  setBlueprintSearch(e.target.value);
                  setBlueprintDropdownOpen(true);
                }}
                onFocus={() => setBlueprintDropdownOpen(true)}
                placeholder="Search blueprint..."
                className="w-full h-12 rounded-md border border-input bg-background pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
              />

              {selectedBlueprintId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlueprintId("");
                    setBlueprintSearch("");
                    setBlueprintApps([]);
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {blueprintDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-72 overflow-y-auto">
                {visibleBlueprints.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedBlueprintId(String(role.id));
                      setBlueprintSearch(role.name);
                      setBlueprintDropdownOpen(false);

                      const selected = roles.find(
                        (r) => String(r.id) === String(role.id)
                      );

                      if (!selected || !selected.applications.length) {
                        setBlueprintApps([]);
                        return;
                      }

                      const mappedApps = selected.applications.map(
                        (app: any) => ({
                          id: app.id || app.appId,
                          name: app.name || app.appName,
                          category: app.category || "General",
                          icon: app.icon || "📦",
                          accessLevel:
                            app.accessLevel || "Standard",
                          grantedDate:
                            app.grantedDate ||
                            new Date()
                              .toISOString()
                              .split("T")[0],
                          essential: app.essential || false,
                        })
                      );

                      setBlueprintApps(mappedApps);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-0"
                  >
                    <div className="font-medium">{role.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Applications */}

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
            2
          </span>

          <h3 className="text-lg font-semibold">
            Add Application(s)
          </h3>
        </div>

        {/* Application */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Select Application
          </label>

          <Select
            value={selectedAppToAdd}
            onValueChange={setSelectedAppToAdd}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Choose application..." />
            </SelectTrigger>

            <SelectContent>
              {availableAppsToAdd
                .filter(
                  (app) =>
                    !blueprintApps.find((a) => a.id === app.id)
                )
                .map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role */}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Choose Role
          </label>

          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Choose role..." />
            </SelectTrigger>

            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}

        {selectedAppToAdd &&
          selectedRole &&
          selectedProject &&
          selectedBlueprintId && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleAddApp}
                className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
              >
                <Plus className="h-4 w-4" />
                Add Application
              </Button>
            </div>
          )}
      </div>
    </motion.div>
  );
};