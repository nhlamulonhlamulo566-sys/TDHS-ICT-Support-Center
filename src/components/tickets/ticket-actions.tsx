
'use client';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, ArrowUpCircle, Trash2, UserPlus, WandSparkles, Info } from "lucide-react"
import { Ticket, UserRole } from "@/lib/types"
import { AssignTechnicianDialog } from "./assign-technician-dialog"
import { ResolveTicketDialog } from "./resolve-ticket-dialog"
import { EscalateTicketDialog } from "./escalate-ticket-dialog"
import { DiagnoseTicketDialog } from "./diagnose-ticket-dialog"
import { DeleteTicketDialog } from "./delete-ticket-dialog"
import { ViewTicketDetailsDialog } from "./view-ticket-details-dialog"
import { useState } from "react"
import { useUserProfile } from "@/hooks/use-user-profile"

interface TicketActionsProps {
  ticket: Ticket;
}

export function TicketActions({ ticket }: TicketActionsProps) {
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);
  const [isDiagnoseDialogOpen, setIsDiagnoseDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const { userProfile } = useUserProfile();

  const isAdmin = userProfile?.role === UserRole.Admin;
  const isTechnician = userProfile?.role === UserRole.Technician;
  const isSupervisor = userProfile?.role === UserRole.Supervisor;
  const isHelpDesk = userProfile?.role === UserRole.HelpDesk;

  const isUnassignedOpenTicket = ticket.status === 'Open' && !ticket.assignedToId;

  const canAssign = isUnassignedOpenTicket && (isAdmin || isSupervisor || isHelpDesk || isTechnician);
  const canResolve = !isUnassignedOpenTicket && (isTechnician || isSupervisor || isAdmin) && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
  const canEscalate = !isUnassignedOpenTicket && (isTechnician || isSupervisor || isAdmin) && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
  const canDiagnose = !isUnassignedOpenTicket && (isTechnician || isSupervisor || isAdmin) && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
  const canViewDetails = !isUnassignedOpenTicket && (isTechnician || isSupervisor || isAdmin);
  const canDelete = isAdmin;

  // If the ticket is unassigned, only show the assign action.
  if (isUnassignedOpenTicket) {
    if (canAssign) {
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setIsAssignDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Assign Technician</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AssignTechnicianDialog ticket={ticket} isOpen={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen} />
        </>
      );
    } else {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button aria-haspopup="true" size="icon" variant="ghost" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
                 </DropdownMenuContent>
            </DropdownMenu>
        );
    }
  }

  const noActions = !canAssign && !canResolve && !canEscalate && !canDelete && !canDiagnose && !canViewDetails;

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {canViewDetails && (
           <DropdownMenuItem onSelect={() => setIsViewDetailsDialogOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
        )}
        {canDiagnose && (
           <DropdownMenuItem onSelect={() => setIsDiagnoseDialogOpen(true)}>
            <WandSparkles className="mr-2 h-4 w-4" />
            <span>AI Diagnosis</span>
          </DropdownMenuItem>
        )}
        {(canViewDetails || canDiagnose) && <DropdownMenuSeparator />}
        {canResolve && (
          <DropdownMenuItem onSelect={() => setIsResolveDialogOpen(true)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Resolve</span>
          </DropdownMenuItem>
        )}
        {canEscalate && (
          <DropdownMenuItem onSelect={() => setIsEscalateDialogOpen(true)}>
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            <span>Escalate</span>
          </DropdownMenuItem>
        )}
        
        {canDelete && (canResolve || canEscalate) && <DropdownMenuSeparator />}
        
        {canDelete && (
           <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        )}
        
        {noActions && <DropdownMenuItem disabled>No actions available</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
    {canAssign && <AssignTechnicianDialog ticket={ticket} isOpen={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen} />}
    {canResolve && <ResolveTicketDialog ticket={ticket} isOpen={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen} />}
    {canEscalate && <EscalateTicketDialog ticket={ticket} isOpen={isEscalateDialogOpen} onOpenChange={setIsEscalateDialogOpen} />}
    {canDiagnose && <DiagnoseTicketDialog ticket={ticket} isOpen={isDiagnoseDialogOpen} onOpenChange={setIsDiagnoseDialogOpen} />}
    {canDelete && <DeleteTicketDialog ticket={ticket} isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />}
    {canViewDetails && <ViewTicketDetailsDialog ticket={ticket} isOpen={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen} />}
    </>
  )
}
