'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { LogCallForm } from "./log-call-form";
import { useState } from "react";

export function LogCallDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Log New Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Log New Call</DialogTitle>
          <DialogDescription>
            Provide your details and describe the issue you are experiencing. An
            ICT technician will be assigned shortly.
          </DialogDescription>
        </DialogHeader>
        <LogCallForm setDialogOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  );
}
