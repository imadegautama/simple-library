import { Head } from '@inertiajs/react';
import { AlertTriangle, Book, BookOpen, Calendar, CheckCircle, Package, RotateCcw, TrendingUp, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleBarChart } from '@/components/ui/simple-bar-chart';
import { StatsCard } from '@/components/ui/stats-card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    totalBuku: number;
    totalAnggota: number;
    totalPeminjaman: number;
    bukuDipinjam: number;
    totalStokBuku: number;
    bukuTersedia: number;
    bukuHabis: number;
    peminjamanHariIni: number;
    pengembalianHariIni: number;
    peminjamanTerlambat: number;
    totalDenda: number;
    peminjamanBulanIni: number;
}

interface ChartData {
    date: string;
    day: string;
    peminjaman: number;
    pengembalian: number;
}

interface BukuPopuler {
    judul: string;
    pengarang: string;
    total_dipinjam: number;
}

interface AnggotaAktif {
    name: string;
    email: string;
    total_peminjaman: number;
}

interface DashboardProps {
    stats: DashboardStats;
    chartData: ChartData[];
    bukuPopuler: BukuPopuler[];
    anggotaAktif: AnggotaAktif[];
}

export default function Dashboard({ stats, chartData, bukuPopuler, anggotaAktif }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Welcome Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-foreground">Dashboard Perpustakaan</h1>
                    <p className="mt-2 text-muted-foreground">Ringkasan aktivitas dan statistik sistem perpustakaan</p>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Buku"
                        value={stats.totalBuku}
                        icon={Book}
                        description={`${stats.totalStokBuku} total eksemplar`}
                        className="border-blue-200 bg-blue-50/50"
                    />
                    <StatsCard
                        title="Total Anggota"
                        value={stats.totalAnggota}
                        icon={Users}
                        description="Anggota terdaftar"
                        className="border-green-200 bg-green-50/50"
                    />
                    <StatsCard
                        title="Sedang Dipinjam"
                        value={stats.bukuDipinjam}
                        icon={BookOpen}
                        description="Buku dalam peminjaman"
                        className="border-orange-200 bg-orange-50/50"
                    />
                    <StatsCard
                        title="Buku Tersedia"
                        value={stats.bukuTersedia}
                        icon={CheckCircle}
                        description={`${stats.bukuHabis} buku habis stok`}
                        className="border-emerald-200 bg-emerald-50/50"
                    />
                </div>

                {/* Activity Stats */}
                <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                    <StatsCard title="Pinjam Hari Ini" value={stats.peminjamanHariIni} icon={Calendar} description="Transaksi hari ini" />
                    <StatsCard title="Kembali Hari Ini" value={stats.pengembalianHariIni} icon={RotateCcw} description="Pengembalian hari ini" />
                    <StatsCard
                        title="Terlambat"
                        value={stats.peminjamanTerlambat}
                        icon={AlertTriangle}
                        description="Melewati jatuh tempo"
                        className="border-red-200 bg-red-50/50"
                    />
                    <StatsCard
                        title="Total Denda"
                        value={`Rp ${stats.totalDenda.toLocaleString('id-ID')}`}
                        icon={TrendingUp}
                        description="Denda terkumpul"
                        className="border-purple-200 bg-purple-50/50"
                    />
                </div>

                {/* Summary Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Bulan Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg bg-blue-50 p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.peminjamanBulanIni}</div>
                                <p className="text-sm text-muted-foreground">Peminjaman Bulan Ini</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{((stats.bukuTersedia / stats.totalBuku) * 100).toFixed(1)}%</div>
                                <p className="text-sm text-muted-foreground">Buku Tersedia</p>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-4 text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {((stats.bukuDipinjam / stats.totalStokBuku) * 100).toFixed(1)}%
                                </div>
                                <p className="text-sm text-muted-foreground">Tingkat Peminjaman</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.peminjamanTerlambat}</div>
                                <p className="text-sm text-muted-foreground">Peminjaman Terlambat</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Members */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Anggota Paling Aktif
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            {anggotaAktif.length > 0 ? (
                                anggotaAktif.map((anggota, index) => (
                                    <div key={index} className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                                        <div className="text-center">
                                            <h4 className="text-sm font-semibold">{anggota.name}</h4>
                                            <p className="truncate text-xs text-muted-foreground">{anggota.email}</p>
                                            <div className="mt-2">
                                                <span className="text-2xl font-bold text-blue-600">{anggota.total_peminjaman}</span>
                                                <p className="text-xs text-muted-foreground">peminjaman</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full">
                                    <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data anggota aktif</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Charts and Lists */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Activity Chart */}
                    <SimpleBarChart data={chartData} title="Aktivitas 7 Hari Terakhir" />

                    {/* Popular Books */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Buku Paling Populer
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {bukuPopuler.length > 0 ? (
                                    bukuPopuler.map((buku, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold">{buku.judul}</h4>
                                                <p className="text-xs text-muted-foreground">{buku.pengarang}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-blue-600">{buku.total_dipinjam}</span>
                                                <p className="text-xs text-muted-foreground">kali dipinjam</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-4 text-center text-sm text-muted-foreground">Belum ada data peminjaman</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
