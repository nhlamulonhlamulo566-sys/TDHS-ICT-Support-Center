import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case 'Open':
      return <Badge variant="default" className="capitalize border-transparent bg-sky-500 hover:bg-sky-500/80">Open</Badge>;
    case 'In Progress':
      return <Badge variant="default" className="capitalize border-transparent bg-amber-500 hover:bg-amber-500/80">In Progress</Badge>;
    case 'Resolved':
      return <Badge variant="default" className="capitalize border-transparent bg-emerald-500 hover:bg-emerald-500/80">Resolved</Badge>;
    case 'Escalated':
      return <Badge variant="destructive" className="capitalize">Escalated</Badge>;
    case 'Closed':
      return <Badge variant="secondary" className="capitalize">Closed</Badge>;
    default:
      return <Badge variant="outline" className="capitalize">{status}</Badge>;
  }
}
