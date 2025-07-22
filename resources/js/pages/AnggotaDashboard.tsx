import { Head } from '@inertiajs/react';
import { AlertTriangle, Book, BookOpen, Calendar, CheckCircle2, Clock, RotateCcw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface BukuInfo {
    judul: string;
    pengarang: string;
    penerbit: string;
}

interface PeminjamanAktif {
    id_peminjaman: number;
    tanggal_pinjam: string;
    tanggal_jatuh_tempo: string;
    status: string;
    catatan?: string;
    buku: BukuInfo[];
    is_terlambat: boolean;
    hari_terlambat: number;
}

interface RiwayatPeminjaman {
    id_peminjaman: number;
    tanggal_pinjam: string;
    tanggal_jatuh_tempo: string;
    tanggal_kembali: string;
    denda: number;
    status: string;
    buku: BukuInfo[];
}

interface UserInfo {
    name: string;
    email: string;
}

interface AnggotaStats {
    totalPeminjaman: number;
    bukuDipinjam: number;
    totalTerlambat: number;
    totalDenda: number;
}

interface AnggotaDashboardProps {
    peminjamanAktif: PeminjamanAktif[];
    riwayatPeminjaman: RiwayatPeminjaman[];
    stats: AnggotaStats;
    user: UserInfo;
}

export default function AnggotaDashboard({ peminjamanAktif, riwayatPeminjaman, stats, user }: AnggotaDashboardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (isLate: boolean, hariTerlambat: number) => {
        if (isLate) {
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Terlambat {hariTerlambat} hari
                </span>
            );
        }
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Aktif</span>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Anggota" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Welcome Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Selamat datang, {user.name}!</h1>
                    <p className="mt-2 text-muted-foreground">Kelola peminjaman buku Anda dan lihat riwayat aktivitas</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Peminjaman"
                        value={stats.totalPeminjaman}
                        icon={Book}
                        description="Seluruh riwayat peminjaman"
                        className="border-blue-200 bg-blue-50/50"
                    />
                    <StatsCard
                        title="Sedang Dipinjam"
                        value={stats.bukuDipinjam}
                        icon={BookOpen}
                        description="Buku yang belum dikembalikan"
                        className="border-green-200 bg-green-50/50"
                    />
                    <StatsCard
                        title="Terlambat"
                        value={stats.totalTerlambat}
                        icon={AlertTriangle}
                        description="Melewati batas waktu"
                        className="border-red-200 bg-red-50/50"
                    />
                    <StatsCard
                        title="Total Denda"
                        value={`Rp ${stats.totalDenda.toLocaleString('id-ID')}`}
                        icon={Clock}
                        description="Denda yang telah dibayar"
                        className="border-purple-200 bg-purple-50/50"
                    />
                </div>

                {/* Active Loans */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Peminjaman Aktif
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {peminjamanAktif.length > 0 ? (
                            <div className="space-y-4">
                                {peminjamanAktif.map((peminjaman) => (
                                    <div key={peminjaman.id_peminjaman} className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="mb-2 text-lg font-semibold">Peminjaman #{peminjaman.id_peminjaman}</h3>
                                                {getStatusBadge(peminjaman.is_terlambat, peminjaman.hari_terlambat)}
                                            </div>
                                        </div>

                                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">Tanggal Pinjam</p>
                                                <p className="font-medium">{formatDate(peminjaman.tanggal_pinjam)}</p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-sm text-muted-foreground">Batas Pengembalian</p>
                                                <p className={`font-medium ${peminjaman.is_terlambat ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatDate(peminjaman.tanggal_jatuh_tempo)}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-sm text-muted-foreground">Buku yang Dipinjam:</p>
                                            <div className="space-y-2">
                                                {peminjaman.buku.map((book, index) => (
                                                    <div key={index} className="flex items-center gap-3 rounded-md bg-gray-50 p-3">
                                                        <Book className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <p className="font-medium">{book.judul}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {book.pengarang} • {book.penerbit}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {peminjaman.catatan && (
                                            <div className="mt-4 rounded-md bg-blue-50 p-3">
                                                <p className="mb-1 text-sm text-muted-foreground">Catatan:</p>
                                                <p className="text-sm">{peminjaman.catatan}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
                                <h3 className="mb-2 text-lg font-medium text-foreground">Tidak ada peminjaman aktif</h3>
                                <p className="text-muted-foreground">Anda saat ini tidak memiliki buku yang sedang dipinjam</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RotateCcw className="h-5 w-5" />
                            Riwayat Peminjaman Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {riwayatPeminjaman.length > 0 ? (
                            <div className="space-y-4">
                                {riwayatPeminjaman.map((riwayat) => (
                                    <div key={riwayat.id_peminjaman} className="rounded-lg border bg-card p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <h4 className="font-medium">Peminjaman #{riwayat.id_peminjaman}</h4>
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                                Selesai
                                            </span>
                                        </div>

                                        <div className="mb-3 grid gap-3 text-sm md:grid-cols-3">
                                            <div>
                                                <p className="text-muted-foreground">Dipinjam</p>
                                                <p>{new Date(riwayat.tanggal_pinjam).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Dikembalikan</p>
                                                <p>{new Date(riwayat.tanggal_kembali).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Denda</p>
                                                <p className={riwayat.denda > 0 ? 'font-medium text-red-600' : 'text-green-600'}>
                                                    {riwayat.denda > 0 ? `Rp ${riwayat.denda.toLocaleString('id-ID')}` : 'Tidak ada'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            {riwayat.buku.map((book, index) => (
                                                <p key={index} className="text-sm text-muted-foreground">
                                                    • {book.judul}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-foreground">Belum ada riwayat</h3>
                                <p className="text-muted-foreground">Riwayat peminjaman Anda akan muncul di sini</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
