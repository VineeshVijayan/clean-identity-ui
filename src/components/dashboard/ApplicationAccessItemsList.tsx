import { ApplicationStatusBadge } from "@/components/dashboard/ApplicationStatusBadge";
import { formatAccessLine } from "@/lib/application-access";
import type { ApplicationAccessRequestItem } from "@/services/application-api";

type Props = {
  items?: ApplicationAccessRequestItem[] | null;
};

export const ApplicationAccessItemsList = ({ items }: Props) => {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No application items.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-md border border-border bg-muted/30 p-3 space-y-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-sm text-foreground">
              {item.applicationName || "Application"}
            </p>
            {item.status ? <ApplicationStatusBadge status={item.status} /> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatAccessLine({
              resourceName: item.resourceName,
              resourceKey: item.externalResourceKey,
              roleName: item.roleName,
            })}
          </p>
          {item.failureReason ? (
            <p className="text-xs text-destructive">{item.failureReason}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
};
