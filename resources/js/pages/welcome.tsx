import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, Calendar, Clock, Library, Search, Shield, TrendingUp, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type SharedData } from '@/types';

interface BukuData {
    id: number;
    judul: string;
    pengarang: string;
    penerbit: string;
    tahun_terbit: string;
    stok: number;
    deskripsi?: string;
    cover?: string;
}

interface Stats {
    totalBuku: number;
    bukuTersedia: number;
    memberCount: number;
    totalPeminjaman: number;
}

interface WelcomeProps {
    bukuTersedia: BukuData[];
    stats: Stats;
}

export default function Welcome({ bukuTersedia, stats }: WelcomeProps) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: BookOpen,
            title: 'Koleksi Lengkap',
            description: 'Ribuan buku dari berbagai genre dan kategori untuk semua kalangan',
        },
        {
            icon: Clock,
            title: 'Layanan 24/7',
            description: 'Akses katalog buku dan layanan perpustakaan kapan saja',
        },
        {
            icon: Search,
            title: 'Pencarian Mudah',
            description: 'Temukan buku favorit dengan sistem pencarian yang canggih',
        },
        {
            icon: Shield,
            title: 'Sistem Aman',
            description: 'Data dan riwayat peminjaman terjaga dengan sistem keamanan tinggi',
        },
    ];

    return (
        <>
            <Head title="SiPerpus - Sistem Informasi Perpustakaan">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                {/* Header Navigation */}
                <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                    <div className="container mx-auto px-4 py-4">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Library className="h-8 w-8 text-green-600" />
                                <span className="text-2xl font-bold text-gray-900">SiPerpus</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={route('dashboard')}>
                                            Dashboard
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="outline" asChild>
                                            <Link href={route('login')}>Masuk</Link>
                                        </Button>
                                        <Button asChild>
                                            <Link href={route('register')}>Daftar</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-4 py-20">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
                            Selamat Datang di
                            <span className="block text-green-600">SiPerpus</span>
                        </h1>
                        <p className="mb-8 text-xl leading-relaxed text-gray-600">
                            Sistem Informasi Perpustakaan modern yang memudahkan Anda dalam mengelola dan meminjam buku dengan teknologi terdepan
                        </p>

                        {!auth.user && (
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Button size="lg" asChild>
                                    <Link href={route('register')}>
                                        <Users className="mr-2 h-5 w-5" />
                                        Daftar Sekarang
                                    </Link>
                                </Button>
                                <Button variant="outline" size="lg" asChild>
                                    <Link href={route('login')}>Masuk ke Sistem</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-white py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-green-600 md:text-4xl">{stats.totalBuku.toLocaleString()}</div>
                                <div className="text-gray-600">Total Buku</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-green-600 md:text-4xl">{stats.bukuTersedia.toLocaleString()}</div>
                                <div className="text-gray-600">Buku Tersedia</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-green-600 md:text-4xl">{stats.memberCount.toLocaleString()}</div>
                                <div className="text-gray-600">Anggota Aktif</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-3xl font-bold text-green-600 md:text-4xl">{stats.totalPeminjaman.toLocaleString()}</div>
                                <div className="text-gray-600">Total Peminjaman</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Mengapa Memilih SiPerpus?</h2>
                            <p className="mx-auto max-w-2xl text-xl text-gray-600">
                                Kami menyediakan layanan perpustakaan modern dengan fitur-fitur unggulan
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => (
                                <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                                    <CardHeader>
                                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                                            <feature.icon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-base">{feature.description}</CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Books Section */}
                <section className="bg-gray-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Koleksi Buku Terbaru</h2>
                            <p className="text-xl text-gray-600">Jelajahi koleksi buku terbaru yang tersedia di perpustakaan kami</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {bukuTersedia.map((buku) => (
                                <Card key={buku.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                                    {/* Book Cover */}
                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                        {buku.cover ? (
                                            <img
                                                src={buku.cover}
                                                alt={`Cover ${buku.judul}`}
                                                className="h-full w-full object-cover transition-transform hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                                                <div className="text-center">
                                                    <BookOpen className="mx-auto h-12 w-12 text-green-400" />
                                                    <p className="mt-2 text-sm text-green-500">No Cover</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <Badge variant="secondary" className="text-xs">
                                                Stok: {buku.stok}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <Badge variant="outline" className="text-xs">
                                                {buku.tahun_terbit}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2 text-lg leading-tight">{buku.judul}</CardTitle>
                                        <CardDescription className="text-sm">oleh {buku.pengarang}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{buku.penerbit}</span>
                                            </div>
                                            {buku.deskripsi && <p className="mt-3 line-clamp-3 text-sm text-gray-500">{buku.deskripsi}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Button size="lg" asChild>
                                <Link href={route('list-buku.index')}>
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Lihat Semua Buku
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-green-600 py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">Mulai Perjalanan Literasi Anda</h2>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-green-100">
                            Bergabunglah dengan ribuan pembaca yang telah mempercayakan kebutuhan literasi mereka kepada SiPerpus
                        </p>

                        {!auth.user ? (
                            <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                <Button size="lg" variant="secondary" asChild>
                                    <Link href={route('register')}>
                                        <Users className="mr-2 h-5 w-5" />
                                        Daftar Gratis
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Button size="lg" variant="secondary" asChild>
                                <Link href={route('dashboard')}>
                                    <TrendingUp className="mr-2 h-5 w-5" />
                                    Ke Dashboard
                                </Link>
                            </Button>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 py-12 text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center justify-between md:flex-row">
                            <div className="mb-4 flex items-center space-x-2 md:mb-0">
                                <Library className="h-8 w-8 text-green-400" />
                                <span className="text-2xl font-bold">SiPerpus</span>
                            </div>
                            <div className="text-center text-gray-400 md:text-right">
                                <p>&copy; 2025 SiPerpus. Sistem Informasi Perpustakaan.</p>
                                <p className="mt-1 text-sm">Membangun budaya literasi untuk Indonesia yang lebih cerdas.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
