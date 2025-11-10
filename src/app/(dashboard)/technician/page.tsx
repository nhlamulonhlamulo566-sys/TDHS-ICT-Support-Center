
'use client';
import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Ticket, User, UserRole } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { TicketTable } from '@/components/tickets/ticket-table';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSearch } from '@/hooks/use-search';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Papa from 'papaparse';

export default function TechnicianPage() {
  const firestore = useFirestore();
  const { userProfile, isLoading: userLoading } = useUserProfile();
  const { searchTerm } = useSearch();

  const ticketsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tickets');
  }, [firestore]);

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<Ticket>(ticketsCollection);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

  const assignedTickets = useMemo(() => {
    if (!tickets || !userProfile || !users) return [];
    
    let technicianTickets: Ticket[];

    if (userProfile.role === UserRole.Admin) {
      // Admins see all tickets assigned to any technician
      const technicianIds = users.filter(u => u.role === UserRole.Technician).map(u => u.id);
       technicianTickets = tickets.filter(
        (ticket) => 
          ticket.assignedToId &&
          technicianIds.includes(ticket.assignedToId) &&
          ticket.status !== 'Resolved' &&
          ticket.status !== 'Closed'
      );
    } else {
       // Technicians see only their own assigned tickets
       technicianTickets = tickets.filter(
        (ticket) => 
          ticket.assignedToId === userProfile.uid &&
          ticket.status !== 'Resolved' &&
          ticket.status !== 'Closed'
      );
    }

    if (!searchTerm) {
      return technicianTickets;
    }

    return technicianTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tickets, userProfile, users, searchTerm]);

  const handleDownload = () => {
    if (!assignedTickets) return;

    const formattedData = assignedTickets.map(ticket => ({
      'Ticket Number': ticket.ticketNumber,
      'Title': ticket.title,
      'Status': ticket.status,
      'Priority': ticket.priority || 'Not Set',
      'Created At': ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : 'N/A',
      'Description': ticket.description,
    }));

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'assigned-tickets.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = userLoading || ticketsLoading || usersLoading;

  if (isLoading) {
    return (
       <div>
        <PageHeader title="Technician View" />
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
      <PageHeader title={userProfile?.role === UserRole.Admin ? "All Technician Tickets" : "My Assigned Tickets"}>
        <Button variant="outline" onClick={handleDownload} disabled={!assignedTickets || assignedTickets.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </PageHeader>
      <TicketTable tickets={assignedTickets} />
    </div>
  );
}
