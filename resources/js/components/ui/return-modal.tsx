import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type ReturnModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    peminjaman: {
        id_peminjaman: number;
        tanggal_jatuh_tempo: string;
        status: string;
    } | null;
    onConfirm?: () => void;
};

export function ReturnModal({ open, onOpenChange, peminjaman, onConfirm }: ReturnModalProps) {
    const [tanggalKembali, setTanggalKembali] = useState<Date>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Reset tanggal kembali ke hari ini setiap kali modal dibuka
    useEffect(() => {
        if (open) {
            setTanggalKembali(new Date());
            setIsLoading(false);
            setIsCalendarOpen(false);
        }
    }, [open]);

    // Cleanup when component unmounts
    useEffect(() => {
        return () => {
            setIsLoading(false);
            setIsCalendarOpen(false);
        };
    }, []);

    // Hitung denda
    const calculateFine = () => {
        if (!peminjaman) return 0;

        const jatuhTempo = new Date(peminjaman.tanggal_jatuh_tempo);
        const returnDate = tanggalKembali;

        // Set waktu ke 00:00:00 untuk perbandingan yang akurat
        jatuhTempo.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);

        if (returnDate <= jatuhTempo) {
            return 0;
        }

        const diffTime = returnDate.getTime() - jatuhTempo.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Denda Rp 2.000 per hari
        return diffDays * 2000;
    };

    const handleReturn = async () => {
        if (!peminjaman) return;

        setIsLoading(true);

        try {
            const denda = calculateFine();

            router.post(
                route('peminjaman.return', peminjaman.id_peminjaman),
                {
                    tanggal_pengembalian: format(tanggalKembali, 'yyyy-MM-dd'),
                    denda: denda,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsLoading(false);
                        onOpenChange(false);
                        if (onConfirm) {
                            onConfirm();
                        }
                    },
                    onError: (errors) => {
                        console.error('Error returning book:', errors);
                        setIsLoading(false);
                    },
                    onFinish: () => {
                        setIsLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error('Error processing return:', error);
            setIsLoading(false);
        }
    };

    const fine = calculateFine();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>Pengembalian Buku</DialogTitle>
                    <DialogDescription>
                        Proses pengembalian buku. Masukkan tanggal pengembalian dan sistem akan menghitung denda otomatis jika terlambat.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tanggal Jatuh Tempo */}
                    <div className="space-y-2">
                        <Label>Tanggal Jatuh Tempo</Label>
                        <Input
                            value={peminjaman ? format(new Date(peminjaman.tanggal_jatuh_tempo), 'dd MMMM yyyy', { locale: id }) : ''}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    {/* Tanggal Pengembalian */}
                    <div className="space-y-2">
                        <Label htmlFor="tanggal-kembali">Tanggal Pengembalian</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !tanggalKembali && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {tanggalKembali ? (
                                        format(tanggalKembali, 'dd MMMM yyyy', { locale: id })
                                    ) : (
                                        <span>Pilih tanggal</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={tanggalKembali}
                                    onSelect={(date: Date | undefined) => {
                                        if (date) {
                                            setTanggalKembali(date);
                                            setIsCalendarOpen(false);
                                        }
                                    }}
                                    disabled={(date: Date) => date > new Date() || date < new Date('1900-01-01')}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Informasi Denda */}
                    {fine > 0 && (
                        <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-red-800">Terlambat!</h4>
                                    <p className="text-sm text-red-600">
                                        Buku dikembalikan {Math.ceil((tanggalKembali.getTime() - new Date(peminjaman?.tanggal_jatuh_tempo || '').getTime()) / (1000 * 60 * 60 * 24))} hari setelah jatuh tempo
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-red-700">
                                        Rp {fine.toLocaleString('id-ID')}
                                    </p>
                                    <p className="text-xs text-red-600">Denda</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {fine === 0 && (
                        <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-green-800">Tepat Waktu!</h4>
                                    <p className="text-sm text-green-600">
                                        Tidak ada denda untuk pengembalian ini
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-700">Rp 0</p>
                                    <p className="text-xs text-green-600">Denda</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOpenChange(false);
                        }}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleReturn();
                        }}
                        disabled={isLoading}
                        className="min-w-[100px]"
                    >
                        {isLoading ? 'Memproses...' : 'Kembalikan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
