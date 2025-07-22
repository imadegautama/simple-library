import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { BookOpen, Library } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-background to-emerald-50/30 dark:from-green-950/20 dark:via-background dark:to-emerald-950/10">
            <div className="flex min-h-screen">
                {/* Left Side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-12">
                    <div className="mx-auto max-w-md">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                                <Library className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Simple Library</h1>
                                <p className="text-sm text-muted-foreground">Sistem Manajemen Perpustakaan</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-foreground">Kelola Koleksi Buku</h3>
                                    <p className="text-sm text-muted-foreground">Organisir dan kelola semua koleksi buku perpustakaan dengan mudah</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-foreground">Manajemen Anggota</h3>
                                    <p className="text-sm text-muted-foreground">Daftarkan dan kelola data anggota perpustakaan</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                    <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="mb-1 font-semibold text-foreground">Peminjaman & Pengembalian</h3>
                                    <p className="text-sm text-muted-foreground">Tracking peminjaman dan pengembalian buku secara real-time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2 lg:px-12">
                    <div className="w-full max-w-sm">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col items-center gap-6">
                                <Link href={route('home')} className="flex flex-col items-center gap-3 font-medium">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                                        <AppLogoIcon className="h-8 w-8" />
                                    </div>
                                    <span className="sr-only">{title}</span>
                                </Link>

                                <div className="space-y-3 text-center">
                                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                                    <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
                                </div>
                            </div>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
