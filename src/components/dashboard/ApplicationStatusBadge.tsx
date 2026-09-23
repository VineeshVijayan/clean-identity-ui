import { Badge } from "@/components/ui/badge";
import {
  formatRequestStatus,
  requestStatusClassName,
} from "@/lib/application-access";

type Props = {
  status?: string | null;
  label?: string;
};

export const ApplicationStatusBadge = ({ status, label }: Props) => (
  <Badge variant="outline" className={requestStatusClassName(status)}>
    {label || formatRequestStatus(status)}
  </Badge>
);
