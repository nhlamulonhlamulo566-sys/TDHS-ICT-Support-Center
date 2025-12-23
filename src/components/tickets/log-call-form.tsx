
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

const formSchema = z.object({
  persalNumber: z.string().min(1, { message: "Persal Number is required." }),
  firstName: z.string().min(1, { message: "First Name is required." }),
  lastName: z.string().min(1, { message: "Last Name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  cellphone: z.string().min(1, { message: "Cellphone number is required." }),
  jobTitle: z.string().min(1, { message: "Job Title is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  district: z.string().min(1, { message: "Please select a district." }),
  facilityName: z.string().min(1, { message: "Facility Name is required." }),
  issueDescription: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

interface LogCallFormProps {
  setDialogOpen: (isOpen: boolean) => void;
}


export function LogCallForm({ setDialogOpen }: LogCallFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();

  const districts = [
    "TDHS",
    "Sub-District 1", 
    "Sub-District 2", 
    "Sub-District 3",
    "Sub-District 4", 
    "Sub-District 5", 
    "Sub-District 6", 
    "Sub-District 7"
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      persalNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      cellphone: "",
      jobTitle: "",
      location: "",
      district: "",
      facilityName: "",
      issueDescription: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore || !auth) {
      toast({
        variant: "destructive",
        title: "Database connection not found.",
        description: "Please try again later.",
      });
      return;
    }

    setIsSubmitting(true);
    toast({
      title: "Submitting your ticket...",
      description: "Your request is being processed.",
    });

    try {
      // Ensure we have an anonymous session for the transaction
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const { ticketNumber } = await runTransaction(firestore, async (transaction) => {
        const counterRef = doc(firestore, 'counters', 'tickets');
        
        const counterDoc = await transaction.get(counterRef);
        const currentCount = counterDoc.exists() ? (counterDoc.data()?.count || 0) : 0;
        const newCount = currentCount + 1;
        const newTicketNumber = `TDHS-${newCount}`;

        transaction.set(counterRef, { count: newCount });
        
        const newTicketRef = doc(firestore, "tickets", newTicketNumber);

        transaction.set(newTicketRef, {
          id: newTicketRef.id,
          ticketNumber: newTicketNumber,
          title: values.issueDescription.substring(0, 50) + (values.issueDescription.length > 50 ? '...' : ''),
          description: values.issueDescription,
          status: 'Open',
          category: 'General',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          escalationLevel: null,
          submittedBy: {
            persalNumber: values.persalNumber,
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            cellphone: values.cellphone,
            jobTitle: values.jobTitle,
            location: values.location,
            district: values.district,
            facilityName: values.facilityName,
          }
        });
        
        return { ticketNumber: newTicketNumber };
      });

      toast({
          title: "Ticket Logged Successfully",
          description: `Your ticket number is ${ticketNumber}. A technician will be assigned shortly.`,
          duration: 60000,
      });

      setDialogOpen(false);
      form.reset();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message || "Could not log your call. Please try again later.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="persalNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persal Number</FormLabel>
              <FormControl>
                <Input placeholder="12345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cellphone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cellphone Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Office Administrator" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Building A, Office 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-2 gap-4">
           <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a sub-district" /></SelectTrigger>
                       </FormControl>
                        <SelectContent>
                          {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          <FormField
            control={form.control}
            name="facilityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facility Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tshwane District Hospital" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
          control={form.control}
          name="issueDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Please provide a detailed description of the issue..." {...field} rows={4}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
           <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging..." : "Log Call"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
