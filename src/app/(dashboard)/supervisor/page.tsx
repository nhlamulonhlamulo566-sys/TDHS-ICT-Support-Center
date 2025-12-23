
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

export default function SupervisorPage() {
  const firestore = useFirestore();
  const { userProfile, isLoading: userLoading } = useUserProfile();
  const { searchTerm } = useSearch();

  const ticketsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tickets');
  }, [firestore]);

  const usersCollection = useMemoFirebase(() => {
    // Wait for userProfile to be loaded to ensure auth state is known
    if (!firestore || !userProfile) return null;
    return collection(firestore, 'users');
  }, [firestore, userProfile]);

  const { data: tickets, isLoading: ticketsLoading } = useCollection<Ticket>(ticketsCollection);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

  const assignedTickets = useMemo(() => {
    if (!tickets || !userProfile || !users) return [];

    let supervisorTickets: Ticket[];

    if (userProfile.role === UserRole.Admin) {
      // Admins see all tickets assigned to any supervisor
      const supervisorIds = users.filter(u => u.role === UserRole.Supervisor).map(u => u.id);
      supervisorTickets = tickets.filter(
        (ticket) => 
          ticket.assignedToId &&
          supervisorIds.includes(ticket.assignedToId) &&
          ticket.status !== 'Resolved' &&
          ticket.status !== 'Closed'
      );
    } else {
      // Supervisors see only their own assigned tickets
      supervisorTickets = tickets.filter(
        (ticket) => 
          ticket.assignedToId === userProfile.uid &&
          ticket.status !== 'Resolved' &&
          ticket.status !== 'Closed'
      );
    }
    
    const sortedTickets = supervisorTickets.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

    if (!searchTerm) {
      return sortedTickets;
    }

    return sortedTickets.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tickets, userProfile, users, searchTerm]);
  
  const handleDownload = () => {
    if (!assignedTickets || !users) return;

    const formattedData = assignedTickets.map(ticket => {
      const submitter = ticket.submittedBy;
      return {
        'Ticket Number': ticket.ticketNumber,
        'Title': ticket.title,
        'Status': ticket.status,
        'Priority': ticket.priority || 'Not Set',
        'Created At': ticket.createdAt?.toDate ? ticket.createdAt.toDate().toLocaleString() : 'N/A',
        'Description': ticket.description,
        'Submitter Persal Number': submitter?.persalNumber || 'N/A',
        'Submitter First Name': submitter?.firstName || 'N/A',
        'Submitter Last Name': submitter?.lastName || 'N/A',
        'Submitter Cellphone': submitter?.cellphone || 'N/A',
        'Submitter Location': submitter?.location || 'N/A',
        'Facility Name': submitter?.facilityName || 'N/A',
      };
    });

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'supervisor-tickets.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = userLoading || ticketsLoading || usersLoading;

  if (isLoading) {
    return (
       <div>
        <PageHeader title="Supervisor View" />
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
      <PageHeader title={userProfile?.role === UserRole.Admin ? "All Supervisor Tickets" : "My Assigned Tickets"}>
        <Button variant="outline" onClick={handleDownload} disabled={!assignedTickets || assignedTickets.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </PageHeader>
      <TicketTable tickets={assignedTickets} />
    </div>
  );
}
