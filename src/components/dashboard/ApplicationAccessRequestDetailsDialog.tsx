import { ApplicationAccessItemsList } from "@/components/dashboard/ApplicationAccessItemsList";
import { ApplicationStatusBadge } from "@/components/dashboard/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDateTime,
  formatRequestStatus,
  splitApprovalAndProvisioning,
} from "@/lib/application-access";
import type { ApplicationAccessRequest } from "@/services/application-api";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  request: ApplicationAccessRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allowActions?: boolean;
  actionLoading?: boolean;
  onApprove?: (request: ApplicationAccessRequest) => void;
  onReject?: (request: ApplicationAccessRequest, comments: string) => void;
};

export const ApplicationAccessRequestDetailsDialog = ({
  request,
  open,
  onOpenChange,
  allowActions = false,
  actionLoading = false,
  onApprove,
  onReject,
}: Props) => {
  const [rejecting, setRejecting] = useState(false);
  const [comments, setComments] = useState("");
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    if (!open) {
      setRejecting(false);
      setComments("");
      setCommentError("");
    }
  }, [open, request?.id]);

  if (!request) return null;

  const split = splitApprovalAndProvisioning(request.status);
  const canAction = allowActions && request.status === "PENDING";

  const handleReject = () => {
    if (!comments.trim()) {
      setCommentError("Rejection comments are required.");
      return;
    }
    onReject?.(request, comments.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Application Access Request #{request.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground">Requested by</p>
              <p className="font-medium">{request.requesterName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">For</p>
              <p className="font-medium">{request.targetUserName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Approver</p>
              <p className="font-medium">{request.approverName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Requested date</p>
              <p className="font-medium">{formatDateTime(request.requestedAt)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Approval:</span>
              <ApplicationStatusBadge
                status={split.approval}
                label={formatRequestStatus(split.approval)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Provisioning:</span>
              <ApplicationStatusBadge
                status={
                  split.provisioning === "Not Started"
                    ? "PENDING"
                    : split.provisioning
                }
                label={
                  split.provisioning === "Not Started"
                    ? "Not Started"
                    : formatRequestStatus(split.provisioning)
                }
              />
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Applications</p>
            <ApplicationAccessItemsList items={request.items} />
          </div>

          {request.comments ? (
            <div>
              <p className="text-muted-foreground">Comments</p>
              <p>{request.comments}</p>
            </div>
          ) : null}

          {rejecting ? (
            <div className="space-y-2">
              <Label htmlFor="reject-comments">Rejection comments</Label>
              <Textarea
                id="reject-comments"
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  if (commentError) setCommentError("");
                }}
                placeholder="Explain why this request is being rejected"
              />
              {commentError ? (
                <p className="text-xs text-destructive">{commentError}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {canAction ? (
            rejecting ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejecting(false);
                    setComments("");
                    setCommentError("");
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Confirm Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setRejecting(true)}
                  disabled={actionLoading}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => onApprove?.(request)}
                  disabled={actionLoading}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
