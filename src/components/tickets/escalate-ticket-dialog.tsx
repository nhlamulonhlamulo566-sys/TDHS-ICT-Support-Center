

"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { Ticket, User, UserRole } from "@/lib/types";
import { useUserProfile } from "@/hooks/use-user-profile";

interface EscalateTicketDialogProps {
  ticket: Ticket;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  escalationTargetId: z.string().min(1, { message: "Please select a user to escalate to."}),
  escalationReason: z.string().min(20, { message: "Escalation reason must be at least 20 characters." }),
});

export function EscalateTicketDialog({ ticket, isOpen, onOpenChange }: EscalateTicketDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { userProfile } = useUserProfile();

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users } = useCollection<User>(usersCollection);

  const escalationTargets = useMemo(() => {
    if (!users || !userProfile) return [];
    
    let targets: User[] = [];

    if (userProfile.role === UserRole.Technician) {
      targets = users.filter(user => 
        (user.role === UserRole.Supervisor || user.role === UserRole.Technician) &&
        user.availability === 'Available' &&
        user.id !== userProfile.uid
      );
    } else if (userProfile.role === UserRole.Supervisor || userProfile.role === UserRole.Admin) {
       targets = users.filter(user => 
        (user.role === UserRole.Supervisor) &&
        user.availability === 'Available' &&
        user.id !== userProfile.uid
      );
    }
    
    return targets;
  }, [users, userProfile]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      escalationTargetId: "",
      escalationReason: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !userProfile) return;

    setIsSubmitting(true);
    try {
      const ticketDocRef = doc(firestore, "tickets", ticket.id);
      
      updateDocumentNonBlocking(ticketDocRef, { 
        status: 'Escalated',
        assignedToId: values.escalationTargetId,
        escalatedById: userProfile.uid,
        escalationReason: values.escalationReason,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Ticket Escalated",
        description: `Ticket ${ticket.ticketNumber} has been escalated.`,
      });

      onOpenChange(false);
      form.reset();

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not escalate ticket.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Escalate Ticket</DialogTitle>
          <DialogDescription>
            Escalate ticket <span className="font-semibold">{ticket.ticketNumber}</span> to a higher level of support.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField
                  control={form.control}
                  name="escalationTargetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escalate To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user to escalate to" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {escalationTargets.length > 0 ? escalationTargets.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          )) : <SelectItem value="none" disabled>No escalation targets available</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="escalationReason"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Reason for Escalation</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Provide a clear reason for escalating this ticket..."
                            {...field}
                            rows={5}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <DialogFooter>
                    <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Escalating..." : "Escalate Ticket"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
