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
import { resourceFieldLabel } from "@/lib/application-access";
import { getErrorFromCatch } from "@/lib/api-errors";
import type { IntegrationProject } from "@/lib/integration-api";
import {
  listApplications,
  loadIntegrationCatalog,
  type ApplicationDto,
  type IntegrationRole,
} from "@/services/application-api";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";

export type RequestedApplicationPayload = {
  applicationId: string;
  applicationName: string;
  integrationName: string;
  projectKey: string;
  projectName: string;
  projectId: string;
  roleId: string;
  roleName: string;
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  submitLabel?: string;
  onSubmitted?: (payload: RequestedApplicationPayload) => void;
}

/**
 * Generic Application → Resource → Role picker.
 * Resource options come from `/integrations/{integrationName}/projects`.
 * For Jira that list is projects; other apps reuse the same catalog APIs.
 */
export const RequestedApplicationDialog = ({
  open,
  onOpenChange,
  submitLabel = "Submit Request",
  onSubmitted,
}: Props) => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<IntegrationProject[]>([]);
  const [availableRoles, setAvailableRoles] = useState<IntegrationRole[]>([]);

  const [appId, setAppId] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [roleId, setRoleId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedApp = applications.find((app) => String(app.id) === appId);
  const hasIntegration = Boolean(selectedApp?.integrationName);
  const resourceLabel = resourceFieldLabel(selectedApp?.integrationName);

  useEffect(() => {
    if (!open) return;

    setAppsLoading(true);
    listApplications({ skipLoader: true })
      .then((page) => setApplications(page.content.filter((app) => app.active)))
      .catch((err) => {
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load applications"),
          variant: "destructive",
        });
      })
      .finally(() => setAppsLoading(false));
  }, [open, toast]);

  useEffect(() => {
    setProjectKey("");
    setRoleId("");
    setAvailableProjects([]);
    setAvailableRoles([]);
    setErrors({});
    if (!appId || !selectedApp?.integrationName) return;

    setCatalogLoading(true);
    loadIntegrationCatalog(selectedApp.integrationName, { skipLoader: true })
      .then((catalog) => {
        setAvailableRoles(catalog.roles);
        setAvailableProjects(catalog.projects);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load integration data"),
          variant: "destructive",
        });
      })
      .finally(() => setCatalogLoading(false));
  }, [appId, selectedApp?.integrationName, toast]);

  const reset = () => {
    setAppId("");
    setProjectKey("");
    setRoleId("");
    setErrors({});
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!appId) next.application = "Application is required.";
    if (hasIntegration && !projectKey) {
      next.resource = `${resourceLabel} is required.`;
    }
    if (hasIntegration && !roleId) next.role = "Role is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please complete the required application access fields.",
        variant: "destructive",
      });
      return;
    }

    const project = availableProjects.find((p) => p.key === projectKey);
    const role = availableRoles.find((r) => r.id === roleId);
    onSubmitted?.({
      applicationId: appId,
      applicationName: selectedApp?.name || "",
      integrationName: selectedApp?.integrationName || "",
      projectKey,
      projectName: project?.name || projectKey,
      projectId: project?.id || "",
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
                <SelectValue
                  placeholder={
                    appsLoading ? "Loading applications..." : "Choose an application..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {applications.length === 0 && !appsLoading ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No applications configured.
                  </div>
                ) : (
                  applications.map((app) => (
                    <SelectItem key={app.id} value={String(app.id)}>
                      {app.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.application ? (
              <p className="text-xs text-destructive">{errors.application}</p>
            ) : null}
          </div>

          {hasIntegration ? (
            <>
              <div className="space-y-2">
                <Label>Select {resourceLabel}</Label>
                <Select
                  value={projectKey}
                  onValueChange={setProjectKey}
                  disabled={!appId || catalogLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        catalogLoading
                          ? `Loading ${resourceLabel.toLowerCase()}s...`
                          : `Choose a ${resourceLabel.toLowerCase()}...`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {availableProjects.length === 0 && !catalogLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No {resourceLabel.toLowerCase()}s available.
                      </div>
                    ) : (
                      availableProjects.map((p) => (
                        <SelectItem key={p.id} value={p.key}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.resource ? (
                  <p className="text-xs text-destructive">{errors.resource}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label>Select Role</Label>
                <Select
                  value={roleId}
                  onValueChange={setRoleId}
                  disabled={!appId || catalogLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        catalogLoading ? "Loading roles..." : "Choose a role..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    {availableRoles.length === 0 && !catalogLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No roles available.
                      </div>
                    ) : (
                      availableRoles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.role ? (
                  <p className="text-xs text-destructive">{errors.role}</p>
                ) : null}
              </div>
            </>
          ) : appId ? (
            <p className="text-sm text-muted-foreground">
              This application does not require a project or role.
            </p>
          ) : null}
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
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestedApplicationDialog;
