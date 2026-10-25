import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  confirmationCopy,
  formatPersonName,
  nextManageDelegatesView,
  type DelegateRelationship,
  type ManageDelegatesView,
} from "@/lib/delegate-users";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  fetchIncomingDelegates,
  fetchOutgoingDelegations,
  removeOutgoingDelegation,
  revokeIncomingAccess,
} from "@/services/delegate-api";
import { ArrowLeft, Loader2, ShieldOff, UserMinus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ManageDelegatesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelegationsChanged?: () => void;
};

export const ManageDelegatesDialog = ({
  open,
  onOpenChange,
  onDelegationsChanged,
}: ManageDelegatesDialogProps) => {
  const [view, setView] = useState<ManageDelegatesView>("menu");
  const [incoming, setIncoming] = useState<DelegateRelationship[]>([]);
  const [outgoing, setOutgoing] = useState<DelegateRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<DelegateRelationship | null>(null);

  const resetState = () => {
    setView("menu");
    setIncoming([]);
    setOutgoing([]);
    setLoading(false);
    setPendingId(null);
    setConfirming(null);
  };

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open]);

  const loadList = async (nextView: ManageDelegatesView) => {
    if (nextView === "menu") return;
    setLoading(true);
    try {
      if (nextView === "revoke-access") {
        setIncoming(await fetchIncomingDelegates());
      } else {
        setOutgoing(await fetchOutgoingDelegations());
      }
    } catch (error) {
      toast.error(
        getErrorFromCatch(
          error,
          nextView === "revoke-access"
            ? "Failed to load people with access to your team"
            : "Failed to load managers you can access"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const goTo = (action: "open-revoke" | "open-remove" | "back") => {
    const nextView = nextManageDelegatesView(view, action);
    setConfirming(null);
    setView(nextView);
    void loadList(nextView);
  };

  const people = view === "revoke-access" ? incoming : outgoing;
  const confirmMeta = confirming && view !== "menu" ? confirmationCopy(view, confirming) : null;

  const handleConfirm = async () => {
    if (!confirming || view === "menu") return;
    setPendingId(confirming.requestId);
    try {
      if (view === "revoke-access") {
        await revokeIncomingAccess(confirming.requestId);
        setIncoming((current) => current.filter((item) => item.requestId !== confirming.requestId));
        toast.success("Delegate access revoked");
      } else {
        await removeOutgoingDelegation(confirming.requestId);
        setOutgoing((current) => current.filter((item) => item.requestId !== confirming.requestId));
        toast.success("Delegate access removed");
      }
      setConfirming(null);
      onDelegationsChanged?.();
    } catch (error) {
      toast.error(
        getErrorFromCatch(
          error,
          view === "revoke-access"
            ? "Failed to revoke delegate access"
            : "Failed to remove delegate access"
        )
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        {view === "menu" ? (
          <>
            <DialogHeader>
              <DialogTitle>Manage Delegates</DialogTitle>
              <DialogDescription>
                Choose whether to manage people who can access your team, or managers whose teams you can access.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-4 text-left"
                onClick={() => goTo("open-revoke")}
              >
                <ShieldOff className="h-5 w-5 shrink-0 text-primary" />
                <span className="space-y-1">
                  <span className="block font-medium">Revoke Access</span>
                  <span className="block text-sm font-normal text-muted-foreground">
                    Manage people who have access to my team.
                  </span>
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 px-4 py-4 text-left"
                onClick={() => goTo("open-remove")}
              >
                <UserMinus className="h-5 w-5 shrink-0 text-primary" />
                <span className="space-y-1">
                  <span className="block font-medium">Remove Delegate</span>
                  <span className="block text-sm font-normal text-muted-foreground">
                    Manage managers whose teams I can access as a delegate.
                  </span>
                </span>
              </Button>
            </div>
          </>
        ) : confirmMeta && confirming ? (
          <>
            <DialogHeader>
              <DialogTitle>{confirmMeta.title}</DialogTitle>
              <DialogDescription>{confirmMeta.description}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirming(null)}
                disabled={pendingId != null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => void handleConfirm()}
                disabled={pendingId != null}
              >
                {pendingId != null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {confirmMeta.action}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5"
                  onClick={() => goTo("back")}
                  aria-label="Back to Manage Delegates"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle>
                    {view === "revoke-access" ? "Revoke Access" : "Remove Delegate"}
                  </DialogTitle>
                  <DialogDescription>
                    {view === "revoke-access"
                      ? "People who currently have delegate access to your team."
                      : "Managers whose teams you can currently access as a delegate."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="relative overflow-hidden rounded-md border">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loading && people.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {view === "revoke-access"
                          ? "No one currently has delegate access to your team."
                          : "You are not a delegate for any manager."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    people.map((person) => (
                      <TableRow key={person.requestId}>
                        <TableCell className="font-medium">
                          {person.firstName || formatPersonName(person.firstName, person.lastName) || "—"}
                        </TableCell>
                        <TableCell>{person.lastName || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {person.email || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {person.companyName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{person.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={pendingId != null}
                            onClick={() => setConfirming(person)}
                          >
                            {view === "revoke-access" ? "Revoke" : "Remove"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
