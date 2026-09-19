import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  getAzureUserSyncAudit,
  getAzureUserSyncExecution,
  isAzureSyncInProgress,
  listAzureUserSyncExecutions,
  startAzureUserSync,
  type AzureSyncAudit,
  type AzureSyncJob,
  type AzureSyncJobStatus,
} from "@/services/azure-user-sync-api";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace("T", " ");
  }
  return date.toLocaleString();
};

const statusClassName = (status: AzureSyncJobStatus) => {
  switch (status) {
    case "COMPLETED":
      return "border-transparent bg-emerald-500/15 text-emerald-600";
    case "RUNNING":
    case "PENDING":
      return "border-transparent bg-sky-500/15 text-sky-600";
    case "FAILED":
      return "border-transparent bg-destructive/15 text-destructive";
    case "SKIPPED":
    default:
      return "border-transparent bg-muted text-muted-foreground";
  }
};

const triggerLabel = (job: AzureSyncJob) => {
  if (job.triggeredBy === "SCHEDULER") {
    return "Scheduler";
  }
  return job.requestedByUserId != null ? `User #${job.requestedByUserId}` : "API";
};

export const UserSyncPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<AzureSyncJob[]>([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditJob, setAuditJob] = useState<AzureSyncJob | null>(null);
  const [auditRows, setAuditRows] = useState<AzureSyncAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const pollTimerRef = useRef<number | null>(null);

  const upsertJob = useCallback((job: AzureSyncJob) => {
    setJobs((current) => {
      const index = current.findIndex((item) => item.processId === job.processId);
      if (index === -1) {
        return [job, ...current];
      }
      const next = [...current];
      next[index] = job;
      return next;
    });
  }, []);

  const loadJobs = useCallback(async (requestedPage: number) => {
    try {
      const result = await listAzureUserSyncExecutions(requestedPage, PAGE_SIZE);
      setJobs(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorFromCatch(error, "Failed to load sync history"),
      });
    } finally {
      setLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    setLoaded(false);
    void loadJobs(page);
  }, [loadJobs, page]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current != null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setPollingId(null);
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const pollJob = useCallback(
    async (processId: string) => {
      const startedAt = Date.now();
      setPollingId(processId);

      const tick = async () => {
        try {
          const job = await getAzureUserSyncExecution(processId, { skipLoader: true });
          upsertJob(job);
          if (!isAzureSyncInProgress(job.status)) {
            stopPolling();
            setPage(0);
            await loadJobs(0);
            toast({
              title: job.status === "COMPLETED" ? "User sync completed" : "User sync finished",
              description: job.errorMessage || job.message || `Status: ${job.status}`,
            });
            return;
          }
        } catch (error) {
          stopPolling();
          toast({
            variant: "destructive",
            title: "Error",
            description: getErrorFromCatch(error, "Failed to check sync status"),
          });
          return;
        }

        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          stopPolling();
          toast({
            variant: "destructive",
            title: "Sync still running",
            description: "The job is taking longer than expected. Refresh the history later.",
          });
          return;
        }

        pollTimerRef.current = window.setTimeout(() => {
          void tick();
        }, POLL_INTERVAL_MS);
      };

      await tick();
    },
    [loadJobs, stopPolling, toast, upsertJob]
  );

  const busy = useMemo(
    () => triggering || pollingId != null || jobs.some((job) => isAzureSyncInProgress(job.status)),
    [jobs, pollingId, triggering]
  );

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const job = await startAzureUserSync();
      setPage(0);
      upsertJob(job);
      if (isAzureSyncInProgress(job.status)) {
        toast({
          title: "User sync started",
          description: `Process ${job.processId}`,
        });
        await pollJob(job.processId);
      } else {
        toast({
          title: "User sync recorded",
          description: job.message || `Status: ${job.status}`,
        });
        await loadJobs(0);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to start sync",
        description: getErrorFromCatch(error, "Failed to start user sync"),
      });
    } finally {
      setTriggering(false);
    }
  };

  const handleOpenAudit = async (job: AzureSyncJob) => {
    setAuditJob(job);
    setAuditOpen(true);
    setAuditLoading(true);
    setAuditRows([]);
    try {
      const rows = await getAzureUserSyncAudit(job.processId);
      setAuditRows(rows);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorFromCatch(error, "Failed to load audit log"),
      });
    } finally {
      setAuditLoading(false);
    }
  };

  const showingFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Sync</h1>
          <p className="text-muted-foreground">
            Import users from Azure AD and review execution history
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/user-administration")}
          >
            Back to users
          </Button>
          <Button onClick={handleTrigger} disabled={busy}>
            <RefreshCw className={`h-4 w-4 mr-2 ${triggering || pollingId ? "animate-spin" : ""}`} />
            {pollingId ? "Syncing…" : "Trigger sync"}
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Started</TableHead>
              <TableHead>Triggered by</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="hidden lg:table-cell">Deactivated</TableHead>
              <TableHead className="hidden xl:table-cell">Finished</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loaded ? null : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No sync executions yet.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.processId}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(job.startedAt || job.createdAt)}
                  </TableCell>
                  <TableCell>{triggerLabel(job)}</TableCell>
                  <TableCell>
                    <Badge className={statusClassName(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{job.usersCreated}</TableCell>
                  <TableCell className="hidden md:table-cell">{job.usersUpdated}</TableCell>
                  <TableCell className="hidden lg:table-cell">{job.usersDeactivated}</TableCell>
                  <TableCell className="hidden xl:table-cell whitespace-nowrap">
                    {formatDateTime(job.finishedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAudit(job)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Audit log
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {showingFrom}-{showingTo} of {totalElements} executions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={auditOpen} onOpenChange={setAuditOpen}>
        <SheetContent
          side="right"
          className="w-[70vw] max-w-none sm:max-w-none overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Audit log</SheetTitle>
            <SheetDescription>
              {auditJob
                ? `${auditJob.status} · ${triggerLabel(auditJob)} · ${auditJob.processId}`
                : "Changes recorded during this sync"}
            </SheetDescription>
          </SheetHeader>

          {auditJob?.errorMessage && (
            <p className="mt-4 text-sm text-destructive">{auditJob.errorMessage}</p>
          )}

          <div className="mt-6">
            {auditLoading ? (
              <p className="text-sm text-muted-foreground">Loading audit entries…</p>
            ) : auditRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No audit entries were recorded for this execution.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Old value</TableHead>
                    <TableHead>New value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDateTime(row.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.action}</Badge>
                      </TableCell>
                      <TableCell>{row.entityType}</TableCell>
                      <TableCell>{row.email || "—"}</TableCell>
                      <TableCell>{row.fieldName || "—"}</TableCell>
                      <TableCell className="max-w-[140px] truncate" title={row.oldValue ?? ""}>
                        {row.oldValue || "—"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate" title={row.newValue ?? ""}>
                        {row.newValue || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};
