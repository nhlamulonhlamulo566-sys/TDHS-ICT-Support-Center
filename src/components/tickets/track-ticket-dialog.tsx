
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Ticket, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { StatusBadge } from "./status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Mail, Phone } from "lucide-react";

interface TicketResult {
    ticket: Ticket;
    assignedTo?: User | null;
}

export function TrackTicketDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TicketResult | null | undefined>(undefined); // undefined: not searched, null: not found
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Cannot connect to database." });
      return;
    }
    if (!ticketNumber.trim()) {
      toast({ variant: "destructive", title: "Please enter a ticket number." });
      return;
    }

    setIsLoading(true);
    setResult(undefined);

    try {
      const ticketsRef = collection(firestore, "tickets");
      const q = query(ticketsRef, where("ticketNumber", "==", ticketNumber.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResult(null);
      } else {
        const ticketDoc = querySnapshot.docs[0];
        const ticketData = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
        let assignedToData: User | null = null;

        if (ticketData.assignedToId) {
          const userRef = doc(firestore, "users", ticketData.assignedToId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            assignedToData = { id: userSnap.id, ...userSnap.data() } as User;
          }
        }
        setResult({ ticket: ticketData, assignedTo: assignedToData });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "An unexpected error occurred.",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getAvatarUrl = (avatarId: string) => {
    return PlaceHolderImages.find(img => img.id === avatarId)?.imageUrl;
  }

  const renderResult = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading...</div>;
    }
    if (result === undefined) {
      return <div className="text-center p-8 text-muted-foreground">Enter your ticket number to see its status.</div>;
    }
    if (result === null) {
      return <div className="text-center p-8 text-destructive font-semibold">Ticket not found. Please check the number and try again.</div>;
    }

    const { ticket, assignedTo } = result;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Ticket #{ticket.ticketNumber}</span>
                        <StatusBadge status={ticket.status} />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">{ticket.description}</p>
                </CardContent>
            </Card>

            <Separator />
            
            {ticket.status === 'Open' && !ticket.assignedToId && (
                <p className="text-center text-amber-600 font-semibold p-4 bg-amber-50 rounded-md">Your ticket is awaiting a technician to be assigned.</p>
            )}

            {(ticket.status === 'In Progress' || ticket.status === 'Escalated') && assignedTo && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Assigned To</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={getAvatarUrl(assignedTo.avatar)} alt={assignedTo.name} />
                            <AvatarFallback>{assignedTo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">{assignedTo.name}</p>
                            <p className="text-sm text-muted-foreground">{assignedTo.role}</p>
                            <div className="flex items-center gap-2 pt-1">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href={`mailto:${assignedTo.email}`} className="text-sm text-primary hover:underline">{assignedTo.email}</a>
                            </div>
                             <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{assignedTo.phoneNumber || 'Not available'}</span>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
            )}

            {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                 <p className="text-center text-emerald-600 font-semibold p-4 bg-emerald-50 rounded-md">This ticket has been {ticket.status}. If the issue persists, please log a new call.</p>
            )}

        </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Track Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Track Your Ticket</DialogTitle>
          <DialogDescription>
            Enter your ticket number to check the status of your request.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 pt-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="ticketNumber" className="sr-only">
              Ticket Number
            </Label>
            <Input
              id="ticketNumber"
              placeholder="e.g., TDHS-123"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button type="submit" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        <Separator className="my-4" />
        <div className="min-h-[200px]">
            {renderResult()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
