
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Ticket } from "@/lib/types";
import { diagnoseTicket, DiagnoseTicketOutput } from "@/ai/flows/diagnose-ticket-flow";
import { WandSparkles, Check, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface DiagnoseTicketDialogProps {
  ticket: Ticket;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DiagnoseTicketDialog({ ticket, isOpen, onOpenChange }: DiagnoseTicketDialogProps) {
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseTicketOutput | null>(null);
  const { toast } = useToast();

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    setDiagnosis(null);
    try {
      const result = await diagnoseTicket({ description: ticket.description });
      setDiagnosis(result);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "AI Diagnosis Failed",
        description: error.message || "Could not get a diagnosis at this time.",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a short delay to allow dialog to close gracefully
    setTimeout(() => {
        setDiagnosis(null);
        setIsDiagnosing(false);
    }, 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI-Powered Ticket Diagnosis</DialogTitle>
          <DialogDescription>
            Use AI to analyze ticket <span className="font-semibold">{ticket.ticketNumber}</span> and suggest troubleshooting steps.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                </CardContent>
            </Card>

            <Separator />

            {isDiagnosing && (
                 <div className="flex items-center justify-center p-8 space-x-2">
                    <WandSparkles className="h-6 w-6 animate-pulse text-primary" />
                    <p className="text-muted-foreground">AI is analyzing the ticket...</p>
                 </div>
            )}
            
            {diagnosis && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <Check className="h-5 w-5 text-green-500" />
                            <CardTitle className="text-lg">Potential Diagnosis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{diagnosis.potentialDiagnosis}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                            <ListChecks className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-lg">Suggested Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm list-decimal list-outside pl-5">
                                {diagnosis.suggestedSteps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {!diagnosis && !isDiagnosing && (
                <div className="text-center text-muted-foreground p-4">
                    <p>Click the button below to start the AI diagnosis.</p>
                </div>
            )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="ghost" onClick={handleClose}>Close</Button>
          <Button onClick={handleDiagnose} disabled={isDiagnosing}>
            <WandSparkles className="mr-2 h-4 w-4" />
            {isDiagnosing ? "Diagnosing..." : "Diagnose with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
