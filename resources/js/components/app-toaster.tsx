import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

function AppToaster() {
    const { props } = usePage<SharedData>();

    useEffect(() => {
        if (props?.flash?.success) {
            toast.success(props?.flash?.success, {
                icon: <CheckCircle2 className="h-5 w-5" />,
                style: {
                    background: '#10b981',
                    color: 'white',
                    border: '1px solid #059669',
                },
            });
            router.reload({ only: ['flash'] });
        } else if (props?.flash?.error) {
            toast.error(props?.flash?.error, {
                icon: <XCircle className="h-5 w-5" />,
                style: {
                    background: '#ef4444',
                    color: 'white',
                    border: '1px solid #dc2626',
                },
            });
            router.reload({ only: ['flash'] });
        }
    }, [props?.flash]);

    return (
        <Toaster
            position="top-right"
            richColors
            expand={true}
            offset={16}
            gap={8}
            toastOptions={{
                style: {
                    padding: '16px 20px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(10px)',
                    minWidth: '320px',
                },
                className: 'font-medium backdrop-blur-sm',
                duration: 5000,
                closeButton: true,
            }}
            theme="light"
            visibleToasts={4}
        />
    );
}

export default AppToaster;
