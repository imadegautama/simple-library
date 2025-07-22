import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Calendar, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedBooks {
    data: BukuData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface BooksIndexProps {
    books: PaginatedBooks;
    search: string;
    totalBooks: number;
}

export default function BooksIndex({ books, search }: BooksIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const [searchQuery, setSearchQuery] = useState(search || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(route('list-buku.index'), { search: searchQuery }, { preserveState: true });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    return (
        <>
            <Head title="Koleksi Buku - SiPerpus">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={route('home')}>
                                        <ArrowLeft className="h-4 w-4" />
                                        Kembali
                                    </Link>
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="h-6 w-6 text-green-600" />
                                    <h1 className="text-xl font-bold text-gray-900">Koleksi Buku SiPerpus</h1>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Button asChild>
                                        <Link href={route('dashboard')}>Dashboard</Link>
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
                        </div>
                    </div>
                </header>

                {/* Search and Stats Section */}
                <section className="bg-white py-8 shadow-sm">
                    <div className="container mx-auto px-4">
                        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div className="text-center md:text-left">
                                <p className="text-lg text-gray-600">
                                    Menampilkan{' '}
                                    <span className="font-semibold text-green-600">
                                        {books.from}-{books.to}
                                    </span>{' '}
                                    dari <span className="font-semibold text-green-600">{books.total}</span> buku yang tersedia
                                </p>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
                                <Input
                                    type="text"
                                    placeholder="Cari judul, pengarang, atau penerbit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1"
                                />
                                <Button type="submit" size="sm">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>

                        {search && (
                            <div className="mb-4 flex items-center gap-2">
                                <span className="text-sm text-gray-600">Hasil pencarian untuk:</span>
                                <Badge variant="secondary">"{search}"</Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery('');
                                        router.get(route('list-buku.index'));
                                    }}
                                >
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Books Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {books.data.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {books.data.map((buku) => (
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
                                            <div className="absolute top-2 right-2">
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
                        ) : (
                            <div className="py-16 text-center">
                                <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-600">
                                    {search ? 'Tidak ada hasil pencarian' : 'Belum ada buku tersedia'}
                                </h3>
                                <p className="mt-2 text-gray-500">
                                    {search
                                        ? `Coba kata kunci lain untuk pencarian "${search}"`
                                        : 'Buku akan ditampilkan setelah ditambahkan oleh admin'}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {books.last_page > 1 && (
                            <div className="mt-12 flex justify-center">
                                <div className="flex items-center space-x-1">
                                    {books.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => handlePageChange(link.url)}
                                            disabled={!link.url}
                                            className="min-w-[40px]"
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label.replace('&laquo;', '‹').replace('&raquo;', '›'),
                                                }}
                                            />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA Section */}
                {!auth.user && (
                    <section className="bg-green-600 py-16">
                        <div className="container mx-auto px-4 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-white">Ingin Meminjam Buku?</h2>
                            <p className="mx-auto mb-6 max-w-2xl text-lg text-green-100">
                                Daftar sekarang untuk dapat meminjam buku-buku yang tersedia di perpustakaan kami
                            </p>
                            <Button size="lg" variant="secondary" asChild>
                                <Link href={route('register')}>Daftar Sekarang</Link>
                            </Button>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
