import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface BookData {
    id_buku?: number;
    judul: string;
    penulis: string;
    penerbit: string;
    tahun_terbit: string;
    isbn: string;
    deskripsi: string;
    stok: number;
    cover?: string | null;
}

interface FormProps {
    book?: BookData;
    mode?: 'create' | 'edit';
}

type FormDataType = {
    judul: string;
    penulis: string;
    penerbit: string;
    tahun_terbit: string;
    isbn: string;
    deskripsi: string;
    stok: number;
    cover: File | null;
    remove_cover?: boolean;
    _method?: string;
};

function FormBuku({ book, mode = 'create' }: FormProps) {
    const isEditing = mode === 'edit' && book;

    // Dynamic breadcrumbs based on mode
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Manajemen Buku',
            href: '/buku',
        },
        {
            title: isEditing ? 'Edit Buku' : 'Tambah Buku',
            href: '',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm<FormDataType>({
        judul: book?.judul || '',
        penulis: book?.penulis || '',
        penerbit: book?.penerbit || '',
        tahun_terbit: book?.tahun_terbit || '',
        isbn: book?.isbn || '',
        deskripsi: book?.deskripsi || '',
        stok: book?.stok || 1,
        cover: null,
        remove_cover: false,
        ...(isEditing && { _method: 'PUT' }),
    });

    const [previewImage, setPreviewImage] = useState<string | null>(book?.cover ? `/storage/${book.cover}` : null);

    useEffect(() => {
        if (book && mode === 'edit') {
            setData({
                judul: book.judul || '',
                penulis: book.penulis || '',
                penerbit: book.penerbit || '',
                tahun_terbit: book.tahun_terbit || '',
                isbn: book.isbn || '',
                deskripsi: book.deskripsi || '',
                stok: book.stok || 1,
                cover: null,
                remove_cover: false,
                _method: 'PUT',
            });

            if (book.cover) {
                setPreviewImage(`/storage/${book.cover}`);
            }
        }
    }, [book, mode, setData]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const url = isEditing ? `/buku/${book?.id_buku}` : '/buku';

        if (isEditing) {
            post(url, {
                forceFormData: true,
                onSuccess: () => {
                    // Don't reset on edit, just show success message
                },
            });
        } else {
            post(url, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setPreviewImage(null);
                },
            });
        }
    };

    const handleFileChange = (file: File | File[] | null) => {
        // Since we're only accepting single file, take the first one if it's an array
        const singleFile = Array.isArray(file) ? file[0] || null : file;

        setData({
            ...data,
            cover: singleFile,
            remove_cover: false, // Reset remove_cover flag when new file selected
        });

        if (singleFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(singleFile);
        } else {
            setPreviewImage(null);
        }
    };

    const removeImage = () => {
        if (isEditing && book?.cover && !data.cover) {
            // If editing and removing existing cover from server
            setData({
                ...data,
                cover: null,
                remove_cover: true, // Flag to remove existing cover
            });
        } else {
            // If removing newly selected file
            setData({
                ...data,
                cover: null,
                remove_cover: false,
            });
        }
        setPreviewImage(null);
    };

    const currentYear = new Date().getFullYear();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Buku' : 'Tambah Buku'} />

            <div className="space-y-6 p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{isEditing ? 'Edit Buku' : 'Tambah Buku'}</h1>
                    </div>

                    <Button asChild variant="outline">
                        <Link href="/buku">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{isEditing ? 'Edit Informasi Buku' : 'Informasi Buku'}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {/* Judul */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="judul" required>
                                                Judul Buku
                                            </Label>
                                            <Input
                                                id="judul"
                                                type="text"
                                                value={data.judul}
                                                onChange={(e) => setData('judul', e.target.value)}
                                                placeholder="Masukkan judul buku"
                                                className={errors.judul ? 'border-destructive' : ''}
                                            />
                                            {errors.judul && <p className="mt-1 text-sm text-destructive">{errors.judul}</p>}
                                        </div>

                                        {/* Penulis */}
                                        <div>
                                            <Label htmlFor="penulis" required>
                                                Penulis
                                            </Label>
                                            <Input
                                                id="penulis"
                                                type="text"
                                                value={data.penulis}
                                                onChange={(e) => setData('penulis', e.target.value)}
                                                placeholder="Masukkan nama penulis"
                                                className={errors.penulis ? 'border-destructive' : ''}
                                            />
                                            {errors.penulis && <p className="mt-1 text-sm text-destructive">{errors.penulis}</p>}
                                        </div>

                                        {/* Penerbit */}
                                        <div>
                                            <Label htmlFor="penerbit" required>
                                                Penerbit
                                            </Label>
                                            <Input
                                                id="penerbit"
                                                type="text"
                                                value={data.penerbit}
                                                onChange={(e) => setData('penerbit', e.target.value)}
                                                placeholder="Masukkan nama penerbit"
                                                className={errors.penerbit ? 'border-destructive' : ''}
                                            />
                                            {errors.penerbit && <p className="mt-1 text-sm text-destructive">{errors.penerbit}</p>}
                                        </div>

                                        {/* Tahun Terbit */}
                                        <div>
                                            <Label htmlFor="tahun_terbit" required>
                                                Tahun Terbit
                                            </Label>
                                            <Input
                                                id="tahun_terbit"
                                                type="number"
                                                min="1900"
                                                max={currentYear}
                                                value={data.tahun_terbit}
                                                onChange={(e) => setData('tahun_terbit', e.target.value)}
                                                placeholder="YYYY"
                                                className={errors.tahun_terbit ? 'border-destructive' : ''}
                                            />
                                            {errors.tahun_terbit && <p className="mt-1 text-sm text-destructive">{errors.tahun_terbit}</p>}
                                        </div>

                                        {/* ISBN */}
                                        <div>
                                            <Label htmlFor="isbn">ISBN</Label>
                                            <Input
                                                id="isbn"
                                                type="text"
                                                value={data.isbn}
                                                onChange={(e) => setData('isbn', e.target.value)}
                                                placeholder="978-xxx-xxx-xxx-x"
                                                className={errors.isbn ? 'border-destructive' : ''}
                                            />
                                            {errors.isbn && <p className="mt-1 text-sm text-destructive">{errors.isbn}</p>}
                                        </div>

                                        {/* Stok */}
                                        <div>
                                            <Label htmlFor="stok" required>
                                                Stok
                                            </Label>
                                            <Input
                                                id="stok"
                                                type="number"
                                                min="0"
                                                value={data.stok}
                                                onChange={(e) => setData('stok', parseInt(e.target.value) || 0)}
                                                className={errors.stok ? 'border-destructive' : ''}
                                            />
                                            {errors.stok && <p className="mt-1 text-sm text-destructive">{errors.stok}</p>}
                                        </div>

                                        {/* Deskripsi */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="deskripsi">Deskripsi</Label>
                                            <Textarea
                                                id="deskripsi"
                                                value={data.deskripsi}
                                                onChange={(e) => setData('deskripsi', e.target.value)}
                                                placeholder="Masukkan deskripsi buku (opsional)"
                                                rows={4}
                                                className={errors.deskripsi ? 'border-destructive' : ''}
                                            />
                                            {errors.deskripsi && <p className="mt-1 text-sm text-destructive">{errors.deskripsi}</p>}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? isEditing
                                                    ? 'Memperbarui...'
                                                    : 'Menyimpan...'
                                                : isEditing
                                                  ? 'Perbarui Buku'
                                                  : 'Simpan Buku'}
                                        </Button>
                                        {!isEditing && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    reset();
                                                    setPreviewImage(null);
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cover Image */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Cover Buku</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {previewImage ? (
                                    <div className="relative">
                                        <img src={previewImage} alt="Preview cover" className="w-full rounded-lg border" />
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="destructive"
                                            className="absolute -top-2 -right-2"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                                        <div className="text-center">
                                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {isEditing ? 'Belum ada cover atau pilih cover baru' : 'Belum ada cover'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <FileInput
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={errors.cover ? 'border-destructive' : ''}
                                    placeholder={isEditing ? 'Pilih cover baru (opsional)' : 'Pilih file cover...'}
                                />

                                {errors.cover && <p className="text-sm text-destructive">{errors.cover}</p>}

                                <p className="text-xs text-muted-foreground">
                                    Maksimal 5MB. Format: JPG, PNG, WebP
                                    {isEditing && <br />}
                                    {isEditing && 'Kosongkan jika tidak ingin mengubah cover'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default FormBuku;
