
'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, AlertTriangle, CheckCircle, User, MessageSquare, ArrowRightCircle } from "lucide-react";
import { collection } from 'firebase/firestore';
import { Ticket, UserRole } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user, userProfile, isLoading: isUserLoading } = useUserProfile();
  const firestore = useFirestore();

  const ticketsCollection = useMemoFirebase(() => {
    // Only fetch tickets if firestore and the user profile are available.
    if (!firestore || !userProfile) return null;
    return collection(firestore, 'tickets');
  }, [firestore, userProfile]);

  const { data: allTickets, isLoading: ticketsLoading } = useCollection<Ticket>(ticketsCollection);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isRoleTechnicianOrSupervisor = useMemo(() => {
    if (!userProfile) return false;
    return (
      userProfile.role === UserRole.Technician ||
      userProfile.role === UserRole.Supervisor
    );
  }, [userProfile]);

  const ticketsForUser = useMemo(() => {
    if (!allTickets || !userProfile) return [];
    if (isRoleTechnicianOrSupervisor && userProfile.uid) {
      return allTickets.filter(ticket => ticket.assignedToId === userProfile.uid);
    }
    // For Admin or other roles, return all tickets
    return allTickets;
  }, [allTickets, userProfile, isRoleTechnicianOrSupervisor]);

  const recentActivity = useMemo(() => {
    if (!ticketsForUser) return [];
    return ticketsForUser
      .sort((a, b) => (b.updatedAt?.toDate?.() ?? 0) > (a.updatedAt?.toDate?.() ?? 0) ? 1 : -1)
      .slice(0, 5);
  }, [ticketsForUser]);

  const stats = useMemo(() => {
    const ticketsToAnalyze = ticketsForUser;
    
    if (!ticketsToAnalyze) return [
      { title: "Active Tickets", value: 0, icon: Activity },
      { title: "High Priority", value: 0, icon: AlertTriangle },
      { title: "Escalated", value: 0, icon: Clock },
      { title: "Resolved Today", value: 0, icon: CheckCircle },
    ];
    
    const activeTickets = ticketsToAnalyze.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    const highPriority = ticketsToAnalyze.filter(t => (t.priority === 'High' || t.priority === 'Critical') && t.status !== 'Resolved' && t.status !== 'Closed').length;
    const escalatedTickets = ticketsToAnalyze.filter(t => t.status === 'Escalated').length;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const resolvedToday = ticketsToAnalyze.filter(t => {
       if (t.status === 'Resolved' && t.resolvedAt?.toDate) {
         const resolvedDate = format(t.resolvedAt.toDate(), 'yyyy-MM-dd');
         return resolvedDate === today;
       }
       return false;
    }).length;
  
    return [
      { title: "Active Tickets", value: activeTickets, icon: Activity },
      { title: "High Priority", value: highPriority, icon: AlertTriangle },
      { title: "Escalated", value: escalatedTickets, icon: Clock },
      { title: "Resolved Today", value: resolvedToday, icon: CheckCircle },
    ];
  }, [ticketsForUser]);


  if (isUserLoading || !user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(ticketsLoading) ? Array.from({length: 4}).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-2/3 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/4 bg-muted rounded mt-2"></div>
            </CardContent>
          </Card>
        )) : stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                Current count
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
             <div className="space-y-6">
                {recentActivity.length > 0 ? recentActivity.map(ticket => (
                    <div key={ticket.id} className="flex items-start gap-4">
                       <Avatar className="h-9 w-9">
                           <AvatarFallback>
                             {ticket.status === 'Resolved' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                             {ticket.status === 'Escalated' && <ArrowRightCircle className="h-5 w-5 text-red-500" />}
                             {ticket.status === 'Open' && <MessageSquare className="h-5 w-5 text-sky-500" />}
                             {(ticket.status === 'In Progress' || ticket.status === 'Closed') && <User className="h-5 w-5 text-amber-500" />}
                           </AvatarFallback>
                       </Avatar>
                       <div className="grid gap-1">
                          <p className="text-sm font-medium leading-none">
                              {ticket.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {`Ticket #${ticket.ticketNumber}`} updated to {ticket.status} by {ticket.submittedBy?.firstName} {ticket.submittedBy?.lastName}
                          </p>
                       </div>
                       <div className="ml-auto text-sm text-muted-foreground">
                            {ticket.updatedAt?.toDate ? formatDistanceToNow(ticket.updatedAt.toDate(), { addSuffix: true }) : ''}
                       </div>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                )}
             </div>
        </CardContent>
      </Card>
    </div>
  )
}
