'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import SignInForm from './SignInForm';

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
}

export function SignInDialog({ open, onOpenChange, onSwitchToSignUp }: SignInDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Sign In</DialogTitle>
        </VisuallyHidden>
        <SignInForm onSuccess={() => onOpenChange(false)} onSwitchToSignUp={onSwitchToSignUp} />
      </DialogContent>
    </Dialog>
  );
}
