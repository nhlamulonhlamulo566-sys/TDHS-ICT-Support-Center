
"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc, serverTimestamp } from "firebase/firestore";
import { Ticket } from "@/lib/types";

interface ResolveTicketDialogProps {
  ticket: Ticket;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const formSchema = z.object({
  resolutionComment: z.string().min(20, { message: "Resolution comment must be at least 20 characters." }),
});

export function ResolveTicketDialog({ ticket, isOpen, onOpenChange }: ResolveTicketDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resolutionComment: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    setIsSubmitting(true);
    try {
      const ticketDocRef = doc(firestore, "tickets", ticket.id);
      
      updateDocumentNonBlocking(ticketDocRef, { 
        status: 'Resolved',
        resolutionComment: values.resolutionComment,
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Ticket Resolved",
        description: `Ticket ${ticket.ticketNumber} has been marked as resolved.`,
      });

      onOpenChange(false);
      form.reset();

    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || "Could not resolve ticket.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Ticket</DialogTitle>
          <DialogDescription>
            Provide a resolution comment for ticket <span className="font-semibold">{ticket.ticketNumber}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                 <FormField
                    control={form.control}
                    name="resolutionComment"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Resolution Comment</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe the steps taken to resolve the issue..."
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
                        {isSubmitting ? "Resolving..." : "Mark as Resolved"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
