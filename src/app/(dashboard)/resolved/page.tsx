
'use client'
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Ticket, UserRole } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/components/tickets/ticket-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSearch } from "@/hooks/use-search";


export default function ResolvedPage() {
  const firestore = useFirestore();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { searchTerm } = useSearch();

  const ticketsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tickets');
  }, [firestore]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<Ticket>(ticketsCollection);

  const resolvedTickets = useMemo(() => {
    if (!tickets || !userProfile) return [];
    
    const allResolved = tickets.filter(
      (ticket) => ticket.status === 'Resolved' || ticket.status === 'Closed'
    );

    const isTechnicianRole = 
        userProfile.role === UserRole.Technician ||
        userProfile.role === UserRole.Supervisor;

    let userTickets: Ticket[];
    if (isTechnicianRole) {
        userTickets = allResolved.filter(ticket => ticket.assignedToId === userProfile.uid);
    } else {
        userTickets = allResolved;
    }

    if (!searchTerm) {
      return userTickets;
    }

    return userTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  }, [tickets, userProfile, searchTerm]);

  const isLoading = ticketsLoading || isUserLoading;

  if (isLoading) {
    return (
       <div>
        <PageHeader title="Resolved Tickets" />
        <div className="border rounded-lg p-4">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Resolved Tickets" />
      <TicketTable tickets={resolvedTickets} />
    </div>
  );
}
