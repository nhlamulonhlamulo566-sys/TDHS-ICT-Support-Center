
"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

interface DisableUserDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisableUserDialog({ user, isOpen, onOpenChange }: DisableUserDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDisable = () => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Firestore not available",
        description: "Please try again later.",
      });
      return;
    }

    setIsSubmitting(true);
    
    const userDocRef = doc(firestore, "users", user.id);
    
    // Use the non-blocking update function to set the disabled flag.
    updateDocumentNonBlocking(userDocRef, { disabled: true });

    toast({
      title: "User Disabled",
      description: `The account for ${user.name} has been disabled. They will not be able to log in.`,
    });

    // Optimistically close the dialog. The error will be caught by the global listener if it fails.
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to disable this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent <span className="font-semibold">{user.name}</span> from accessing the system. Their data will be preserved, and you can re-enable their account later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDisable}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? "Disabling..." : "Disable User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
