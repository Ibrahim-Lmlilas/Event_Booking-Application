'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import SignUpForm from './SignUpForm';

interface SignUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpDialog({ open, onOpenChange, onSwitchToSignIn }: SignUpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Sign Up</DialogTitle>
        </VisuallyHidden>
        <SignUpForm 
          onSuccess={() => onOpenChange(false)} 
          onSwitchToSignIn={onSwitchToSignIn}
        />
      </DialogContent>
    </Dialog>
  );
}
