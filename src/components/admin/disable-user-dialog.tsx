
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
import { User, UserRole } from "@/lib/types";
import { disableUser } from "@/ai/flows/disable-user-flow";

interface DisableUserDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisableUserDialog({ user, isOpen, onOpenChange }: DisableUserDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shouldDisable = !user.disabled;
  const actionText = shouldDisable ? "Disable" : "Enable";
  const pastTenseAction = shouldDisable ? "disabled" : "enabled";
  const buttonClass = shouldDisable ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "";

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      if (user.role === UserRole.Admin) {
        throw new Error("Administrator accounts cannot be disabled.");
      }
      
      const result = await disableUser({ uid: user.id, disable: shouldDisable });

      if (result.success) {
        toast({
          title: `User ${pastTenseAction}`,
          description: `Account for ${user.name} has been ${pastTenseAction}.`,
        });
      } else {
        throw new Error(result.message);
      }

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message || `Could not ${actionText.toLowerCase()} the user.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to {actionText.toLowerCase()} this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This will {shouldDisable ? "prevent" : "allow"} <span className="font-semibold">{user.name}</span> from logging in.
            You can {shouldDisable ? "re-enable" : "disable"} their account at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleAction}
            disabled={isSubmitting}
            className={buttonClass}
          >
            {isSubmitting ? `${actionText}ing...` : `${actionText} User`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
