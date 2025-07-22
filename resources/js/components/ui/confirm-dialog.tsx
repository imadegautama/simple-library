import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    variant = 'destructive',
    isLoading = false,
}: ConfirmDialogProps) {
    const handleCancel = () => {
        if (!isLoading) {
            onOpenChange(false);
        }
    };

    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
