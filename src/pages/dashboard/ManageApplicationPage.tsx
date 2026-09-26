import { ApplicationStatusBadge } from "@/components/dashboard/ApplicationStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getErrorFromCatch } from "@/lib/api-errors";
import { resourceFieldLabel } from "@/lib/application-access";
import {
  getApplicationById,
  listApplications,
  loadIntegrationCatalog,
  type ApplicationDto,
  type IntegrationRole,
} from "@/services/application-api";
import type { IntegrationProject } from "@/lib/integration-api";
import { motion } from "framer-motion";
import { AppWindow, ExternalLink, Globe, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StatusFilter = "all" | "active" | "inactive";

export const ManageApplicationPage = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [details, setDetails] = useState<ApplicationDto | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [resources, setResources] = useState<IntegrationProject[]>([]);
  const [roles, setRoles] = useState<IntegrationRole[]>([]);
  const [catalogError, setCatalogError] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter((app) => {
      if (statusFilter === "active" && !app.active) return false;
      if (statusFilter === "inactive" && app.active) return false;
      if (!q) return true;
      return (
        app.name?.toLowerCase().includes(q) ||
        app.description?.toLowerCase().includes(q) ||
        app.integrationName?.toLowerCase().includes(q) ||
        app.appUrl?.toLowerCase().includes(q)
      );
    });
  }, [applications, search, statusFilter]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const page = await listApplications();
        setApplications(page.content);
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

    fetchApplications();
  }, [toast]);

  useEffect(() => {
    if (selectedId == null) {
      setDetails(null);
      setResources([]);
      setRoles([]);
      setCatalogError("");
      return;
    }

    let cancelled = false;
    setDetailsLoading(true);
    setCatalogError("");

    const loadDetails = async () => {
      try {
        const app = await getApplicationById(selectedId, { skipLoader: true });
        if (cancelled) return;
        setDetails(app);

        if (app.integrationName) {
          try {
            const catalog = await loadIntegrationCatalog(app.integrationName, {
              skipLoader: true,
            });
            if (cancelled) return;
            setResources(catalog.projects);
            setRoles(catalog.roles);
          } catch (err) {
            if (cancelled) return;
            setResources([]);
            setRoles([]);
            setCatalogError(
              getErrorFromCatch(err, "Failed to load application resources")
            );
          }
        }
      } catch (err) {
        if (cancelled) return;
        toast({
          title: "Error",
          description: getErrorFromCatch(err, "Failed to load application details"),
          variant: "destructive",
        });
        setSelectedId(null);
      } finally {
        if (!cancelled) setDetailsLoading(false);
      }
    };

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [selectedId, toast]);

  const emptyMessage = search || statusFilter !== "all"
    ? "Try adjusting your search or filters"
    : "No applications configured.";

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
              View all available applications in your organization
            </p>
          </div>
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
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
          </div>

          {!loaded ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : loadError ? (
            <div className="text-center text-destructive py-12">{loadError}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <AppWindow className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No applications configured.</p>
              <p className="text-sm">{emptyMessage}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedId(app.id)}
                  className="text-left"
                >
                  <Card className="group border border-border hover:border-primary/30 transition-colors h-full">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {app.name}
                            </h3>
                            <p className="text-xs text-muted-foreground capitalize">
                              {app.integrationName || "No integration"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={app.active ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {app.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {app.description || "No description"}
                      </p>
                      {app.appUrl ? (
                        <p className="text-xs text-muted-foreground truncate">
                          {app.appUrl}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedId != null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{details?.name || "Application details"}</DialogTitle>
          </DialogHeader>

          {detailsLoading || !details ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6 text-sm">
              <section className="space-y-3">
                <h3 className="font-semibold">Application</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailField label="Name" value={details.name} />
                  <DetailField label="Code" value={details.integrationName || details.name} />
                  <DetailField
                    label="Description"
                    value={details.description || "—"}
                    className="sm:col-span-2"
                  />
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <ApplicationStatusBadge
                      status={details.active ? "COMPLETED" : "REJECTED"}
                      label={details.active ? "Active" : "Inactive"}
                    />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Application URL</p>
                    {details.appUrl ? (
                      <a
                        href={details.appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline break-all"
                      >
                        {details.appUrl}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <p>—</p>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold">Integration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailField
                    label="Provider"
                    value={details.integrationName || "None"}
                  />
                  <DetailField
                    label="Integration type"
                    value={details.integrationName || "Not connected"}
                  />
                  <div>
                    <p className="text-muted-foreground">Configuration status</p>
                    <ApplicationStatusBadge
                      status={details.integrationName ? "COMPLETED" : "PENDING"}
                      label={details.integrationName ? "Configured" : "Not configured"}
                    />
                  </div>
                </div>
              </section>

              {details.integrationName ? (
                <section className="space-y-3">
                  <h3 className="font-semibold">Resources / Access</h3>
                  {catalogError ? (
                    <p className="text-destructive">{catalogError}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground mb-2">
                          Available {resourceFieldLabel(details.integrationName).toLowerCase()}s
                        </p>
                        {resources.length === 0 ? (
                          <p className="text-muted-foreground">None returned by the backend.</p>
                        ) : (
                          <ul className="space-y-1 max-h-48 overflow-y-auto">
                            {resources.map((resource) => (
                              <li key={resource.id} className="rounded-md border px-3 py-2">
                                {resource.name}
                                {resource.key !== resource.name ? (
                                  <span className="text-muted-foreground"> ({resource.key})</span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2">Roles</p>
                        {roles.length === 0 ? (
                          <p className="text-muted-foreground">None returned by the backend.</p>
                        ) : (
                          <ul className="space-y-1 max-h-48 overflow-y-auto">
                            {roles.map((role) => (
                              <li key={role.id} className="rounded-md border px-3 py-2">
                                {role.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const DetailField = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) => (
  <div className={className}>
    <p className="text-muted-foreground">{label}</p>
    <p className="font-medium break-words">{value}</p>
  </div>
);
