import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  listPlatformIntegrations,
  syncPlatformIntegration,
  type PlatformIntegration,
} from "@/services/platform-api";
import { motion } from "framer-motion";
import { Cloud, Database, PlugZap, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const typeLabel = (type: PlatformIntegration["type"]) =>
  type === "DIRECTORY" ? "Auth source" : "HR tool";

const integrationsCopy = (integrations: PlatformIntegration[]) => {
  const directory = integrations.find((item) => item.type === "DIRECTORY" && item.primary);
  const hr = integrations.find((item) => item.type === "HR" && item.primary);
  const directoryName = directory?.displayName ?? "the configured directory";
  const hrName = hr?.displayName ?? "the configured HR tool";
  return `Sign-in stays on local email and password. ${directoryName} is the user directory. ${hrName} is the employee source.`;
};

type AuthSourcesPageProps = {
  type?: PlatformIntegration["type"];
  embedded?: boolean;
};

export const AuthSourcesPage = ({ type, embedded = false }: AuthSourcesPageProps) => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setIntegrations(await listPlatformIntegrations());
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to load integrations",
        description: getErrorFromCatch(error, "Failed to load identity and HR integrations"),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadIntegrations();
  }, [loadIntegrations]);

  const handleSync = async (key: string) => {
    try {
      setSyncingKey(key);
      const result = await syncPlatformIntegration(key);
      toast({
        title: result.success ? "Sync completed" : "Sync failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: getErrorFromCatch(error, "Failed to sync this integration"),
      });
    } finally {
      setSyncingKey(null);
    }
  };

  const visibleIntegrations = type
    ? integrations.filter((integration) => integration.type === type)
    : integrations;

  const emptyTitle =
    type === "DIRECTORY"
      ? "No auth source registered"
      : type === "HR"
        ? "No HR tool registered"
        : "No providers registered";
  const emptyDescription =
    type === "DIRECTORY"
      ? "The hub did not report an identity directory."
      : type === "HR"
        ? "The hub did not report an HR employee source."
        : "The hub did not report a directory or HR provider.";

  return (
    <motion.div
      initial={embedded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {embedded ? (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => void loadIntegrations()} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <PlugZap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Identity & HR integrations
            </h1>
            <p className="text-muted-foreground">
              {integrationsCopy(integrations)}
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadIntegrations()} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading integrations…</p>
      ) : visibleIntegrations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{emptyTitle}</CardTitle>
            <CardDescription>{emptyDescription}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visibleIntegrations.map((integration) => {
            const Icon = integration.type === "DIRECTORY" ? Cloud : Database;
            const configuration = integration.configuration ?? [];
            return (
              <Card key={`${integration.type}-${integration.key}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{integration.displayName}</CardTitle>
                      <CardDescription>
                        {typeLabel(integration.type)} · {integration.key}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {integration.primary && <Badge>Primary</Badge>}
                    <Badge variant={integration.configured ? "default" : "secondary"}>
                      {integration.configured ? "Configured" : "Not configured"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!integration.configured || syncingKey === integration.key}
                      onClick={() => void handleSync(integration.key)}
                    >
                      {syncingKey === integration.key ? "Syncing…" : "Sync"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {configuration.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No configuration details are available for this integration.
                    </p>
                  ) : (
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {configuration.map((item) => (
                        <div key={item.label} className="space-y-1">
                          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
                          <dd className="text-sm break-all">{item.value || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
