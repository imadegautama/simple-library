import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import { ChangeEvent, forwardRef, useRef } from 'react';

import { Button } from './button';

interface FileInputProps {
    accept?: string;
    multiple?: boolean;
    onChange?: (file: File | File[] | null) => void;
    className?: string;
    disabled?: boolean;
    placeholder?: string;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    ({ accept = '*', multiple = false, onChange, className, disabled = false, placeholder = 'Pilih file...' }, ref) => {
        const inputRef = useRef<HTMLInputElement>(null);

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (!files) {
                onChange?.(null);
                return;
            }

            if (multiple) {
                onChange?.(Array.from(files));
            } else {
                onChange?.(files[0] || null);
            }
        };

        const handleClick = () => {
            if (!disabled) {
                inputRef.current?.click();
            }
        };

        return (
            <div className={cn('relative', className)}>
                <input
                    ref={ref || inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    disabled={disabled}
                    className="sr-only"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleClick}
                    disabled={disabled}
                    className="w-full justify-start gap-2"
                >
                    <Upload className="h-4 w-4" />
                    {placeholder}
                </Button>
            </div>
        );
    },
);

FileInput.displayName = 'FileInput';

export { FileInput };
