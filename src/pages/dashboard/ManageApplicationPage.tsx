import {
  ApplicationConfigForm,
  ApplicationSchemaEditor,
} from "@/components/dashboard/ApplicationConfigForm";
import { ApplicationStatusBadge } from "@/components/dashboard/ApplicationStatusBadge";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  configurationStatusLabel,
  formatTimestamp,
  initialConfigValues,
  splitConfigurationValues,
} from "@/lib/application-admin";
import {
  createApplication,
  deleteApplication,
  getApplicationConfiguration,
  isEssentialApplication,
  listApplicationConnectors,
  listApplications,
  testApplicationConnection,
  updateApplication,
  updateApplicationConfiguration,
  updateApplicationEssential,
  updateApplicationStatus,
  type ApplicationConfigField,
  type ApplicationDto,
  type ConnectorDescriptor,
} from "@/services/application-api";
import { motion } from "framer-motion";
import {
  AppWindow,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type StatusFilter = "all" | "active" | "inactive";
type EssentialFilter = "all" | "essential" | "nonessential";
type EditorMode = "create" | "edit" | "configure" | "view";
const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  code: "",
  description: "",
  category: "",
  icon: "",
  appUrl: "",
  integrationName: "custom",
  active: false,
  essential: false,
};

export const ManageApplicationPage = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [connectors, setConnectors] = useState<ConnectorDescriptor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [essentialFilter, setEssentialFilter] = useState<EssentialFilter>("all");
  const [sort, setSort] = useState("name,asc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [schema, setSchema] = useState<ApplicationConfigField[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [secretsConfigured, setSecretsConfigured] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deactivateApp, setDeactivateApp] = useState<ApplicationDto | null>(null);
  const [deleteApp, setDeleteApp] = useState<ApplicationDto | null>(null);

  const selectedConnector = connectors.find((connector) => connector.code === form.integrationName);
  const isCustomIntegration = form.integrationName === "custom" || !form.integrationName;

  const refresh = useCallback(async () => {
    const result = await listApplications({
      search: search.trim() || undefined,
      sort,
      size: PAGE_SIZE,
      page,
      active: statusFilter === "all" ? undefined : statusFilter === "active",
      essential: essentialFilter === "all" ? undefined : essentialFilter === "essential",
    });
    setApplications(result.content);
    setTotalPages(Math.max(1, result.totalPages || 1));
    setTotalElements(result.totalElements ?? result.content.length);
  }, [search, sort, page, statusFilter, essentialFilter]);

  useEffect(() => {
    listApplicationConnectors()
      .then(setConnectors)
      .catch(() => setConnectors([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
        setLoadError("");
      } catch (err) {
        setLoadError(getErrorFromCatch(err, "Failed to load applications"));
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load applications"),
          variant: "destructive",
        });
      } finally {
        setLoaded(true);
      }
    };
    load();
  }, [refresh, toast]);

  const openCreate = () => {
    setEditorMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setSchema([]);
    setConfigValues({});
    setSecretsConfigured({});
    setEditorOpen(true);
  };

  const openEdit = async (app: ApplicationDto, mode: EditorMode) => {
    setEditorMode(mode);
    setEditingId(app.id);
    setForm({
      name: app.name || "",
      code: app.code || "",
      description: app.description || "",
      category: app.category || "",
      icon: app.icon || "",
      appUrl: app.appUrl || "",
      integrationName: app.integrationName || "custom",
      active: app.active,
      essential: isEssentialApplication(app),
    });
    try {
      const config = await getApplicationConfiguration(app.id, { skipLoader: true });
      setSchema(config.schema || []);
      setSecretsConfigured(config.secretsConfigured || {});
      setConfigValues(initialConfigValues(config.schema || [], config.configuration || {}, config.secretsConfigured || {}));
    } catch (err) {
      setSchema([]);
      setConfigValues({});
      if (mode !== "view") {
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load configuration"),
          variant: "destructive",
        });
        return;
      }
    }
    setEditorOpen(true);
  };

  const applyConnectorSchema = (code: string) => {
    setForm((current) => ({ ...current, integrationName: code }));
    const connector = connectors.find((item) => item.code === code);
    const nextSchema = connector?.schema || [];
    setSchema(nextSchema);
    setConfigValues(initialConfigValues(nextSchema, {}, {}));
    setSecretsConfigured({});
  };

  const persist = async () => {
    if (!form.name.trim()) {
      toast({ title: "Error", description: "Application name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { configuration, secrets } = splitConfigurationValues(schema, configValues);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      description: form.description.trim() || undefined,
      category: form.category.trim() || undefined,
      icon: form.icon.trim() || undefined,
      appUrl: form.appUrl.trim() || undefined,
      integrationName: form.integrationName === "custom" ? null : form.integrationName,
      active: form.active,
      essential: form.essential,
      schema,
      configuration,
      secrets,
    };
    try {
      if (editorMode === "create") {
        await createApplication(payload);
        toast({ title: "Success", description: "Application created" });
      } else if (editingId != null && editorMode === "configure") {
        await updateApplicationConfiguration(editingId, { schema, configuration, secrets });
        toast({ title: "Success", description: "Configuration saved. Existing secrets were kept unless replaced." });
      } else if (editingId != null) {
        await updateApplication(editingId, payload);
        toast({ title: "Success", description: "Application updated" });
      }
      setEditorOpen(false);
      setConfigValues({});
      await refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Failed to save application"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (app: ApplicationDto, active: boolean) => {
    try {
      await updateApplicationStatus(app.id, active);
      toast({
        title: "Success",
        description: active
          ? `${app.name} is active`
          : `${app.name} is inactive. Existing user access was not revoked.`,
      });
      await refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Failed to update application status"),
        variant: "destructive",
      });
    }
  };

  const toggleEssential = async (app: ApplicationDto) => {
    try {
      await updateApplicationEssential(app.id, !isEssentialApplication(app));
      await refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Failed to update essential flag"),
        variant: "destructive",
      });
    }
  };

  const runConnectionTest = async (app: ApplicationDto) => {
    try {
      const result = await testApplicationConnection(app.id);
      toast({
        title: result.success ? "Connected" : "Connection failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      await refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Connection test failed"),
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteApp) return;
    try {
      await deleteApplication(deleteApp.id);
      toast({ title: "Success", description: `${deleteApp.name} deleted` });
      setDeleteApp(null);
      await refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Failed to delete application"),
        variant: "destructive",
      });
    }
  };

  const editorTitle =
    editorMode === "create"
      ? "Add Application"
      : editorMode === "configure"
        ? "Configure Integration"
        : editorMode === "view"
          ? "Application Details"
          : "Edit Application";

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
            <h1 className="text-2xl font-bold">Manage Applications</h1>
            <p className="text-muted-foreground">
              Onboard, configure, and control application lifecycle without exposing credentials
            </p>
          </div>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setPage(0);
                setStatusFilter(value as StatusFilter);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={essentialFilter}
              onValueChange={(value) => {
                setPage(0);
                setEssentialFilter(value as EssentialFilter);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Essential" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="essential">Essential</SelectItem>
                <SelectItem value="nonessential">Non-essential</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(value) => {
                setPage(0);
                setSort(value);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name,asc">Name A-Z</SelectItem>
                <SelectItem value="name,desc">Name Z-A</SelectItem>
                <SelectItem value="updatedAt,desc">Recently updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!loaded ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loadError ? (
            <div className="text-center text-destructive py-12">{loadError}</div>
          ) : applications.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <AppWindow className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No applications found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Integration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Essential</TableHead>
                  <TableHead>Configuration</TableHead>
                  <TableHead>Provisioning</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {app.icon ? (
                          <img src={app.icon} alt="" className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                            <AppWindow className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{app.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {app.description || app.category || "No description"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{app.code || "—"}</TableCell>
                    <TableCell className="capitalize">{app.integrationName || "Custom"}</TableCell>
                    <TableCell>
                      <Badge variant={app.active ? "default" : "secondary"}>
                        {app.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EssentialBadge essential={isEssentialApplication(app)} />
                    </TableCell>
                    <TableCell>
                      <ApplicationStatusBadge
                        status={app.configured ? "COMPLETED" : "PENDING"}
                        label={configurationStatusLabel(app)}
                      />
                    </TableCell>
                    <TableCell>{app.provisioningSupported ? "Supported" : "Metadata only"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatTimestamp(app.updatedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${app.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(app, "view")}>View details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(app, "edit")}>Edit application</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {app.active ? (
                            <DropdownMenuItem onClick={() => setDeactivateApp(app)}>Deactivate</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleStatus(app, true)}>Activate</DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => toggleEssential(app)}>
                            {isEssentialApplication(app) ? "Mark non-essential" : "Mark essential"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteApp(app)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {loaded && !loadError && totalElements > 0 ? (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages} · {totalElements} applications
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editorTitle}</DialogTitle>
            <DialogDescription>
              Sensitive credentials are stored encrypted and are never shown after save.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {editorMode !== "configure" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Application Name *</Label>
                  <Input
                    id="app-name"
                    value={form.name}
                    disabled={editorMode === "view"}
                    onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-code">Application Code</Label>
                  <Input
                    id="app-code"
                    value={form.code}
                    disabled={editorMode === "view"}
                    placeholder="Derived from the name if left blank"
                    onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="app-description">Description</Label>
                  <Textarea
                    id="app-description"
                    value={form.description}
                    disabled={editorMode === "view"}
                    onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-category">Category</Label>
                  <Input
                    id="app-category"
                    value={form.category}
                    disabled={editorMode === "view"}
                    onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-icon">Icon / Logo URL</Label>
                  <Input
                    id="app-icon"
                    value={form.icon}
                    disabled={editorMode === "view"}
                    onChange={(e) => setForm((current) => ({ ...current, icon: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-url">Application Base URL</Label>
                  <Input
                    id="app-url"
                    value={form.appUrl}
                    disabled={editorMode === "view"}
                    onChange={(e) => setForm((current) => ({ ...current, appUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Integration Type</Label>
                  <Select
                    value={form.integrationName}
                    disabled={editorMode === "view"}
                    onValueChange={applyConnectorSchema}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select integration" />
                    </SelectTrigger>
                    <SelectContent>
                      {(connectors.length ? connectors : [{ code: "custom", displayName: "Custom / Other" }]).map((connector) => (
                        <SelectItem key={connector.code} value={connector.code}>
                          {connector.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-xs text-muted-foreground">Requires complete configuration</p>
                  </div>
                  <Switch
                    checked={form.active}
                    disabled={editorMode === "view"}
                    onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Essential application</p>
                    <p className="text-xs text-muted-foreground">Reprovisioned when a user is reactivated</p>
                  </div>
                  <Switch
                    checked={form.essential}
                    disabled={editorMode === "view"}
                    onCheckedChange={(checked) => setForm((current) => ({ ...current, essential: checked }))}
                  />
                </div>
              </div>
            )}

            {selectedConnector && !selectedConnector.provisioningSupported && form.integrationName !== "custom" ? (
              <p className="text-sm text-muted-foreground">
                This integration can store credentials, but provisioning requires a registered connector.
              </p>
            ) : null}

            <div className="space-y-3">
              <h3 className="font-semibold">Integration configuration</h3>
              {isCustomIntegration && editorMode !== "view" ? (
                <ApplicationSchemaEditor
                  schema={schema}
                  onChange={(next) => {
                    setSchema(next);
                    setConfigValues((current) => {
                      const retained: Record<string, string> = {};
                      for (const field of next) {
                        retained[field.key] = current[field.key] ?? "";
                      }
                      return retained;
                    });
                  }}
                />
              ) : null}
              <ApplicationConfigForm
                schema={schema}
                values={configValues}
                secretsConfigured={secretsConfigured}
                disabled={editorMode === "view"}
                onChange={(key, value) => setConfigValues((current) => ({ ...current, [key]: value }))}
              />
            </div>
          </div>
          {editorMode !== "view" ? (
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
              <Button onClick={persist} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deactivateApp} onOpenChange={(open) => !open && setDeactivateApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivateApp?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              New provisioning will stop for this application. Existing users keep their current access.
              Deactivation does not deprovision anyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deactivateApp) {
                  toggleStatus(deactivateApp, false);
                  setDeactivateApp(null);
                }
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteApp} onOpenChange={(open) => !open && setDeleteApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteApp?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This is only allowed when the application has no user access history. Prefer deactivation if people already use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

const EssentialBadge = ({ essential }: { essential: boolean }) => (
  <Badge
    variant="outline"
    className={essential ? "bg-warning/10 text-warning border-warning/30" : "text-muted-foreground"}
  >
    {essential ? (
      <>
        <Shield className="h-3 w-3 mr-1" />
        Essential
      </>
    ) : (
      "Non-essential"
    )}
  </Badge>
);
