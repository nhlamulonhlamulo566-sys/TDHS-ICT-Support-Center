import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TicketPriority } from "@/lib/types";
import { ChevronUp, ChevronsUp, AlertCircle, Equal } from "lucide-react";

interface PriorityIconProps {
  priority: TicketPriority;
}

const priorityConfig = {
  Low: { icon: ChevronUp, color: "text-muted-foreground", label: "Low" },
  Medium: { icon: Equal, color: "text-amber-600", label: "Medium" },
  High: { icon: ChevronsUp, color: "text-orange-600", label: "High" },
  Critical: { icon: AlertCircle, color: "text-destructive", label: "Critical" },
};

export function PriorityIcon({ priority }: PriorityIconProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Icon className={`h-5 w-5 ${config.color}`} />
          <span className="sr-only">{config.label} priority</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label} Priority</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
