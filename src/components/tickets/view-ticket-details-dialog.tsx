
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Ticket } from "@/lib/types";
import { User, Mail, Phone, MapPin, Building, Briefcase } from "lucide-react";

interface ViewTicketDetailsDialogProps {
  ticket: Ticket;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div className="flex flex-col">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <p className="text-base font-medium">{value || "N/A"}</p>
        </div>
    </div>
);

export function ViewTicketDetailsDialog({ ticket, isOpen, onOpenChange }: ViewTicketDetailsDialogProps) {
  const { submittedBy } = ticket;
  const fullName = submittedBy ? `${submittedBy.firstName} ${submittedBy.lastName}` : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ticket Details - #{ticket.ticketNumber}</DialogTitle>
          <DialogDescription>
            Complete information for ticket and submitter.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <h3 className="text-lg font-semibold mb-2">Ticket Information</h3>
                <div className="space-y-1">
                    <p><span className="font-semibold">Title:</span> {ticket.title}</p>
                    <p><span className="font-semibold">Description:</span> {ticket.description}</p>
                </div>
            </div>

            <Separator />
            
            {submittedBy && (
                <div>
                    <h3 className="text-lg font-semibold mb-4">Submitter Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem icon={User} label="Full Name" value={fullName} />
                        <DetailItem icon={Briefcase} label="Job Title" value={submittedBy.jobTitle} />
                        <DetailItem icon={Mail} label="Email Address" value={submittedBy.email} />
                        <DetailItem icon={Phone} label="Cellphone" value={submittedBy.cellphone} />
                        <DetailItem icon={MapPin} label="Location" value={submittedBy.location} />
                        <DetailItem icon={Building} label="Facility Name" value={submittedBy.facilityName} />
                    </div>
                </div>
            )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
