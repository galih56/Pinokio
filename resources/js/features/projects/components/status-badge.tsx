import { Badge } from "@/components/ui/badge";
import { capitalizeFirstChar } from "@/lib/common";
import { VariantType } from "@/types/ui";

export const StatusBadge = ({ status } : { status : string }) => {
    let badgeVariant : VariantType = 'outline';
    switch (status) {
      case 'open':
        badgeVariant = 'destructive';
        break;
      case 'idle':
        badgeVariant = 'destructive';
        break;
      case 'resolved':
        badgeVariant = 'info';
        break;
      case 'in progress':
        badgeVariant = 'warning';
        break;
      case 'closed':
        badgeVariant = 'success';
        break;
      default:
        break;
    }
    return <Badge variant={badgeVariant}>{  capitalizeFirstChar(status)}</Badge>
}