
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
import { Search, Mail, Phone, ArrowUpCircle } from "lucide-react";
import { useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Ticket, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { StatusBadge } from "./status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface TicketResult {
  ticket: Ticket;
  assignedTo?: User | null;
  escalatedBy?: User | null;
}

export function TrackTicketDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TicketResult | null | undefined>(
    undefined
  ); // undefined = not searched
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Cannot connect to database.",
      });
      return;
    }

    const trimmed = ticketNumber.trim();
    if (!trimmed) {
      toast({
        variant: "destructive",
        title: "Please enter a ticket number.",
      });
      return;
    }

    setIsLoading(true);
    setResult(undefined);

    try {
      const ticketRef = doc(firestore, "tickets", trimmed);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) {
        setResult(null);
        return;
      }

      const ticketData = {
        id: ticketSnap.id,
        ...ticketSnap.data(),
      } as Ticket;

      let assignedToData: User | null = null;
      if (ticketData.assignedToId) {
        try {
            const userRef = doc(firestore, "users", ticketData.assignedToId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              assignedToData = { id: userSnap.id, ...userSnap.data() } as User;
            }
        } catch (e) { assignedToData = null; }
      }

      let escalatedByData: User | null = null;
      if (ticketData.escalatedById) {
        try {
            const userRef = doc(firestore, "users", ticketData.escalatedById);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              escalatedByData = { id: userSnap.id, ...userSnap.data() } as User;
            }
        } catch (e) { escalatedByData = null; }
      }

      setResult({ ticket: ticketData, assignedTo: assignedToData, escalatedBy: escalatedByData });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description:
          "Could not retrieve ticket. Please check your ticket number and permissions.",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarUrl = (avatarId: string) => {
    const image = PlaceHolderImages.find((img) => img.id === avatarId);
    return image ? image.imageUrl : undefined;
  };

  const renderResult = () => {
    if (isLoading) {
      return <div className="text-center p-8">Loading...</div>;
    }
    if (result === undefined) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          Enter your ticket number to see its status.
        </div>
      );
    }
    if (result === null) {
      return (
        <div className="text-center p-8 text-destructive font-semibold">
          Ticket not found. Please check the number and try again.
        </div>
      );
    }

    const { ticket, assignedTo, escalatedBy } = result;

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
            <p className="text-sm text-muted-foreground mt-2">
              {ticket.description}
            </p>
          </CardContent>
        </Card>

        {ticket.status === "Open" && !ticket.assignedToId && (
          <p className="text-center text-amber-600 font-semibold p-4 bg-amber-50 rounded-md">
            Your ticket is awaiting a technician to be assigned.
          </p>
        )}

        {ticket.status === "Escalated" && (
            <Card className="border-destructive bg-destructive/5">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                        <ArrowUpCircle className="h-5 w-5" />
                        <span>Ticket Escalated</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {escalatedBy && (
                        <p>Escalated by: <span className="font-semibold">{escalatedBy.name}</span></p>
                    )}
                    {ticket.escalationReason && (
                        <p>Reason: <span className="text-muted-foreground">{ticket.escalationReason}</span></p>
                    )}
                </CardContent>
            </Card>
        )}

        {(ticket.status === "In Progress" || ticket.status === "Escalated") &&
          assignedTo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {ticket.status === "Escalated" ? "Escalated To" : "Assigned To"}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={getAvatarUrl(assignedTo.avatar)}
                    alt={assignedTo.name}
                  />
                  <AvatarFallback>
                    {assignedTo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-bold text-lg">{assignedTo.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignedTo.role}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${assignedTo.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {assignedTo.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {assignedTo.phoneNumber || "Not available"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        {(ticket.status === "Resolved" || ticket.status === "Closed") && (
          <Card className="bg-emerald-50 border-emerald-200">
             <CardHeader>
                <CardTitle className="text-lg text-emerald-700">Ticket Resolved</CardTitle>
             </CardHeader>
             <CardContent>
                 {ticket.resolutionComment && (
                    <p className="mb-4 text-sm"><span className="font-semibold">Resolution Note:</span> {ticket.resolutionComment}</p>
                 )}
                <p className="text-sm text-emerald-800">
                    If the issue persists, please log a new call.
                </p>
             </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setTicketNumber("");
      setResult(undefined);
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="min-h-[200px]">{renderResult()}</div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

