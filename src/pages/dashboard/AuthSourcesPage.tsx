import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  listPlatformIntegrations,
  previewHrEmployees,
  testPlatformIntegration,
  type HrEmployeePreview,
  type PlatformIntegration,
} from "@/services/platform-api";
import { motion } from "framer-motion";
import { Cloud, Database, Eye, PlugZap, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const typeLabel = (type: PlatformIntegration["type"]) =>
  type === "DIRECTORY" ? "Identity directory" : "HR source";

export const AuthSourcesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState<PlatformIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<HrEmployeePreview[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewProvider, setPreviewProvider] = useState<string | null>(null);

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

  const handleTest = async (integration: PlatformIntegration) => {
    try {
      setTestingKey(integration.key);
      const result = await testPlatformIntegration(integration.key);
      toast({
        variant: result.success ? "default" : "destructive",
        title: result.success ? "Connection succeeded" : "Connection failed",
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection test failed",
        description: getErrorFromCatch(error, "Failed to test the integration"),
      });
    } finally {
      setTestingKey(null);
    }
  };

  const handlePreview = async (integration: PlatformIntegration) => {
    try {
      setPreviewProvider(integration.displayName);
      setPreviewOpen(true);
      setPreviewLoading(true);
      setPreviewRows(await previewHrEmployees(integration.key));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Preview failed",
        description: getErrorFromCatch(error, "Failed to preview HR employees"),
      });
      setPreviewOpen(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleOpenSync = (integration: PlatformIntegration) => {
    if (integration.type === "DIRECTORY") {
      navigate("/admin/user-sync");
      return;
    }
    navigate("/users");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <PlugZap className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Identity & HR integrations
          </h1>
          <p className="text-muted-foreground">
            Sign-in stays on local email and password. Azure Entra is the user directory.
            Odoo remains the HR employee source.
          </p>
        </div>
        <Button variant="outline" onClick={() => void loadIntegrations()} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading integrations…</p>
      ) : integrations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No providers registered</CardTitle>
            <CardDescription>
              The hub did not report a directory or HR provider.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => {
            const Icon = integration.type === "DIRECTORY" ? Cloud : Database;
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
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => void handleTest(integration)}
                    disabled={testingKey === integration.key}
                  >
                    {testingKey === integration.key ? "Testing…" : "Test connection"}
                  </Button>
                  {integration.type === "HR" && (
                    <Button variant="outline" onClick={() => void handlePreview(integration)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview employees
                    </Button>
                  )}
                  <Button onClick={() => handleOpenSync(integration)}>
                    {integration.type === "DIRECTORY" ? "Open directory sync" : "Open HR sync"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>HR employee preview</DialogTitle>
            <DialogDescription>
              {previewProvider
                ? `Employees currently visible in ${previewProvider}. This does not write users.`
                : "Employees currently visible in the HR source. This does not write users."}
            </DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <p className="text-muted-foreground">Loading preview…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job title</TableHead>
                  <TableHead>Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No employees returned.
                    </TableCell>
                  </TableRow>
                ) : (
                  previewRows.map((row) => (
                    <TableRow key={`${row.externalId}-${row.email}`}>
                      <TableCell>{row.name ?? "—"}</TableCell>
                      <TableCell>{row.email ?? "—"}</TableCell>
                      <TableCell>{row.jobTitle ?? "—"}</TableCell>
                      <TableCell>{row.departmentName ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
