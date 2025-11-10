

'use client'

import { useMemo, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ticket, User } from "@/lib/types";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { StatusBadge } from "./status-badge";
import { TicketActions } from "./ticket-actions";
import { formatDistanceToNow } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { PriorityIcon } from "./priority-icon";


interface TicketTableProps {
  tickets: Ticket[];
}

export function TicketTable({ tickets }: TicketTableProps) {
  const firestore = useFirestore();

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersCollection);

  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find(img => img.id === avatarId)?.imageUrl;
  }

  const ticketsWithUsers = useMemo(() => {
     if (!tickets || !users) return [];
     return tickets.map(ticket => {
        const assignedUser = ticket.assignedToId ? users.find(u => u.id === ticket.assignedToId) : null;
        const assignedByUser = ticket.assignedById ? users.find(u => u.id === ticket.assignedById) : null;
        const escalatedByUser = ticket.escalatedById ? users.find(u => u.id === ticket.escalatedById) : null;
        return {
            ...ticket,
            assignedUser,
            assignedByUser,
            escalatedByUser,
        }
     })
  }, [tickets, users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Tickets</CardTitle>
        <CardDescription>
          A list of tickets in the current view.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                Ticket No.
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Assigned To</TableHead>
              <TableHead className="hidden md:table-cell">Last Update</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))
            ) : ticketsWithUsers.length > 0 ? (
              ticketsWithUsers.map((ticket) => (
                <Fragment key={ticket.id}>
                  <TableRow>
                    <TableCell className="hidden sm:table-cell font-medium">
                      {ticket.ticketNumber}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>
                      {ticket.priority ? <PriorityIcon priority={ticket.priority} /> : <span className="text-muted-foreground text-xs">Not Set</span>}
                    </TableCell>
                    <TableCell className="font-medium max-w-sm">
                      <div className="flex flex-col">
                        <span>{ticket.title}</span>
                        {ticket.assignedByUser && (
                            <span className="text-xs text-muted-foreground">
                                Assigned by {ticket.assignedByUser.name}
                            </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ticket.assignedUser ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(ticket.assignedUser.avatar)} alt={ticket.assignedUser.name} />
                            <AvatarFallback>{ticket.assignedUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{ticket.assignedUser.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                       {ticket.updatedAt?.toDate ? formatDistanceToNow(ticket.updatedAt.toDate(), { addSuffix: true }) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <TicketActions ticket={ticket} />
                    </TableCell>
                  </TableRow>
                  {(ticket.escalationReason || ticket.escalatedByUser) && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-2 px-4 bg-muted/50">
                         <div className="text-xs text-muted-foreground whitespace-normal">
                             {ticket.escalatedByUser && <p className="font-semibold text-destructive">Escalated by: {ticket.escalatedByUser.name}</p>}
                             {ticket.escalationReason && <p><span className="font-semibold">Reason:</span> {ticket.escalationReason}</p>}
                         </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
                 <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                    No tickets found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
