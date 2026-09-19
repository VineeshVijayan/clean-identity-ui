import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { applicationsListPath, identityFetch, connectorFetch } from "@/services/api-config";
import { getApiErrorMessage, getErrorFromCatch, readResponseBody } from "@/lib/api-errors";
import { mapIntegrationProjects, type IntegrationProject } from "@/lib/integration-api";
import { useEffect, useState } from "react";

type Application = {
  id: string;
  name: string;
  integrationName: string;
};

type IntegrationRole = { id: string; name: string };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmitted?: (payload: {
    applicationId: string;
    applicationName: string;
    projectKey: string;
    roleId: string;
    roleName: string;
  }) => void;
}

/**
 * Reuses the same Application → Project → Role loading logic used in
 * the "Requested Application(s)" section of Manage Team Access.
 */
export const RequestedApplicationDialog = ({
  open,
  onOpenChange,
  onSubmitted,
}: Props) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableProjects, setAvailableProjects] = useState<IntegrationProject[]>([]);
  const [availableRoles, setAvailableRoles] = useState<IntegrationRole[]>([]);

  const [appId, setAppId] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [roleId, setRoleId] = useState("");

  /* Fetch applications when dialog opens */
  useEffect(() => {
    if (!open) return;
    identityFetch(applicationsListPath, {
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (r) => {
        if (!r.ok) {
          const body = await readResponseBody(r);
          throw new Error(getApiErrorMessage(body, "Failed to load applications"));
        }
        return r.json();
      })
      .then((res) => {
        const list = (res?.data?.content || []).map((app: any) => ({
          id: String(app.id),
          name: app.name,
          integrationName: app.integrationName,
        }));
        setApplications(list);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load applications"),
          variant: "destructive",
        });
      });
  }, [open]);

  /* Dependent projects + roles */
  useEffect(() => {
    setProjectKey("");
    setRoleId("");
    setAvailableProjects([]);
    setAvailableRoles([]);
    if (!appId) return;

    const selected = applications.find((a) => a.id === appId);
    if (!selected?.integrationName) return;
    const base = `/integrations/${selected.integrationName.toLowerCase()}`;

    Promise.all([
      connectorFetch(`${base}/roles`, {
        headers: { Accept: "application/json" },
      }).then(async (r) => {
        if (!r.ok) {
          const body = await readResponseBody(r);
          throw new Error(getApiErrorMessage(body, "Failed to load roles"));
        }
        return r.json();
      }),
      connectorFetch(`${base}/projects`, {
        headers: { Accept: "application/json" },
      }).then(async (r) => {
        if (!r.ok) {
          const body = await readResponseBody(r);
          throw new Error(getApiErrorMessage(body, "Failed to load projects"));
        }
        return r.json();
      }),
    ])
      .then(([rolesData, projectsData]) => {
        setAvailableRoles(Array.isArray(rolesData) ? rolesData : rolesData.data || []);
        setAvailableProjects(mapIntegrationProjects(projectsData));
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load integration data"),
          variant: "destructive",
        });
      });
  }, [appId, applications]);

  const reset = () => {
    setAppId("");
    setProjectKey("");
    setRoleId("");
  };

  const handleSubmit = () => {
    if (!appId || !projectKey || !roleId) {
      toast({
        title: "Validation Error",
        description: "Please select Application, Project and Role.",
        variant: "destructive",
      });
      return;
    }
    const app = applications.find((a) => a.id === appId);
    const role = availableRoles.find((r) => r.id === roleId);
    toast({
      title: "Application Requested",
      description: `${app?.name} has been added to the request.`,
    });
    onSubmitted?.({
      applicationId: appId,
      applicationName: app?.name || "",
      projectKey,
      roleId,
      roleName: role?.name || "",
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Requested Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Select Application</Label>
            <Select value={appId} onValueChange={setAppId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an application..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Project</Label>
            <Select value={projectKey} onValueChange={setProjectKey} disabled={!appId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {availableProjects.map((p) => (
                  <SelectItem key={p.id} value={p.key}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={!appId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a role..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {availableRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestedApplicationDialog;
