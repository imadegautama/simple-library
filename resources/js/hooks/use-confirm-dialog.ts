import { useState } from 'react';

interface UseConfirmDialogOptions<T = unknown> {
    onConfirm: (item?: T) => void;
}

export function useConfirmDialog<T = unknown>({ onConfirm }: UseConfirmDialogOptions<T>) {
    const [item, setItem] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const showConfirm = (itemToConfirm: T) => {
        setItem(itemToConfirm);
    };

    const hideConfirm = () => {
        if (!isLoading) {
            setItem(null);
            setIsLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (item) {
            setIsLoading(true);
            try {
                await onConfirm(item);
                hideConfirm();
            } catch (error) {
                setIsLoading(false);
                throw error;
            }
        }
    };

    return {
        item,
        isOpen: !!item,
        isLoading,
        showConfirm,
        hideConfirm,
        handleConfirm,
    };
}
