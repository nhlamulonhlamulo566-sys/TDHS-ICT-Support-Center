

"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { Ticket, User, UserRole, TicketPriority } from "@/lib/types";
import { useUserProfile } from "@/hooks/use-user-profile";

interface AssignTechnicianDialogProps {
  ticket: Ticket;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AssignTechnicianDialog({ ticket, isOpen, onOpenChange }: AssignTechnicianDialogProps) {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { userProfile } = useUserProfile();

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users } = useCollection<User>(usersCollection);

  const availableTechnicians = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      (user.role === UserRole.Technician || user.role === UserRole.Supervisor) &&
      user.availability === 'Available'
    );
  }, [users]);
  
  const handleAssign = async () => {
    if (!firestore || !selectedTechnicianId || !selectedPriority || !userProfile) {
      toast({
        variant: "destructive",
        title: "Assignment Failed",
        description: "Please select a technician and priority.",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const ticketDocRef = doc(firestore, "tickets", ticket.id);
      
      updateDocumentNonBlocking(ticketDocRef, { 
        assignedToId: selectedTechnicianId,
        assignedById: userProfile.uid,
        priority: selectedPriority,
        status: 'In Progress',
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Ticket Assigned",
        description: `Ticket ${ticket.ticketNumber} has been assigned.`,
      });

      onOpenChange(false);
      
      setSelectedTechnicianId(null);
      setSelectedPriority(null);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not assign ticket.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
            setSelectedTechnicianId(null);
            setSelectedPriority(null);
        }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
          <DialogDescription>
            Assign ticket <span className="font-semibold">{ticket.ticketNumber}</span> to an available technician.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="technician">Select Technician</Label>
                <Select onValueChange={setSelectedTechnicianId} value={selectedTechnicianId || ""}>
                    <SelectTrigger id="technician">
                        <SelectValue placeholder="Select an available technician" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableTechnicians.length > 0 ? availableTechnicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                                {tech.name} ({tech.role})
                            </SelectItem>
                        )) : <SelectItem value="none" disabled>No available technicians</SelectItem>}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="priority">Set Priority</Label>
                <Select onValueChange={(value) => setSelectedPriority(value as TicketPriority)} value={selectedPriority || ""}>
                    <SelectTrigger id="priority">
                        <SelectValue placeholder="Set ticket priority" />
                    </SelectTrigger>
                    <SelectContent>
                       {Object.values(TicketPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={isSubmitting || !selectedTechnicianId || !selectedPriority}>
            {isSubmitting ? "Assigning..." : "Assign Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
