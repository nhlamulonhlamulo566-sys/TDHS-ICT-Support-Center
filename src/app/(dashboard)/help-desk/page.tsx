
'use client';
import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Ticket } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { TicketTable } from "@/components/tickets/ticket-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSearch } from "@/hooks/use-search";

export default function HelpDeskPage() {
  const firestore = useFirestore();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { searchTerm } = useSearch();

  const ticketsCollection = useMemoFirebase(() => {
    // Only fetch tickets if the user is loaded and authenticated.
    if (!firestore || !userProfile) return null;
    return collection(firestore, 'tickets');
  }, [firestore, userProfile]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<Ticket>(ticketsCollection);

  const openTickets = useMemo(() => {
    if (!tickets) return [];
    
    // Filter for tickets that are 'Open' and unassigned, then sort by creation date
    const unassignedOpenTickets = tickets
      .filter((ticket) => ticket.status === 'Open' && !ticket.assignedToId)
      .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

    if (!searchTerm) {
      return unassignedOpenTickets;
    }

    return unassignedOpenTickets.filter(ticket => 
        (ticket.title && ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  }, [tickets, searchTerm]);

  const isLoading = ticketsLoading || isUserLoading;

  if (isLoading) {
    return (
       <div>
        <PageHeader title="Help Desk - New Tickets" />
        <div className="border rounded-lg">
            <div className="p-6">
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="p-6 pt-0">
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-5 w-20" />
                            <div className="flex-1">
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Help Desk - New Tickets" />
      <TicketTable tickets={openTickets} />
    </div>
  );
}
