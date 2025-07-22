import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface AnggotaData {
    id: number;
    name: string;
    email: string;
}

interface BukuData {
    id_buku: number;
    judul: string;
    pengarang: string;
    penerbit: string;
    stok: number;
}

interface PeminjamanData {
    id_peminjaman?: number;
    id_anggota: number;
    tanggal_pinjam: string;
    tanggal_jatuh_tempo: string;
    tanggal_kembali?: string;
    denda: number;
    status: string;
    catatan?: string;
    buku_ids: number[];
    anggota?: AnggotaData;
    peminjaman_details?: {
        id_peminjaman_detail: number;
        id_buku: number;
        buku?: BukuData;
    }[];
}

interface FormProps {
    peminjaman?: PeminjamanData;
    anggotaList: AnggotaData[];
    bukuList: BukuData[];
    mode?: 'create' | 'edit';
}

type FormDataType = {
    id_anggota: string;
    tanggal_pinjam: string;
    tanggal_jatuh_tempo: string;
    tanggal_kembali: string;
    denda: number;
    status: string;
    catatan: string;
    buku_ids: string[];
    _method?: string;
};

function FormPeminjaman({ peminjaman, anggotaList = [], bukuList = [], mode = 'create' }: FormProps) {
    const isEditing = mode === 'edit' && peminjaman;
    const isReturned = peminjaman?.status === 'dikembalikan';
    const isReadonly = isEditing && isReturned;
    const [selectedBooks, setSelectedBooks] = useState<string[]>(peminjaman?.buku_ids?.map((id) => id.toString()) || ['']);

    // Dynamic breadcrumbs based on mode
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Manajemen Peminjaman',
            href: route('peminjaman.index'),
        },
        {
            title: isReadonly ? 'Detail Peminjaman' : isEditing ? 'Edit Peminjaman' : 'Tambah Peminjaman',
            href: '',
        },
    ];

    // Calculate default due date (7 days from loan date)
    const calculateDueDate = (loanDate: string) => {
        const date = new Date(loanDate);
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors, reset } = useForm<FormDataType>({
        id_anggota: peminjaman?.id_anggota?.toString() || '',
        tanggal_pinjam: peminjaman?.tanggal_pinjam || new Date().toISOString().split('T')[0],
        tanggal_jatuh_tempo: peminjaman?.tanggal_jatuh_tempo || calculateDueDate(new Date().toISOString().split('T')[0]),
        tanggal_kembali: peminjaman?.tanggal_kembali || '',
        denda: peminjaman?.denda || 0,
        status: peminjaman?.status || 'dipinjam',
        catatan: peminjaman?.catatan || '',
        buku_ids: selectedBooks,
        ...(isEditing && { _method: 'PUT' }),
    });

    // Prepare combobox options
    const anggotaOptions: ComboboxOption[] = anggotaList.map((anggota) => ({
        value: anggota.id.toString(),
        label: `${anggota.name}`,
    }));

    const bukuOptions: ComboboxOption[] = bukuList.map((buku) => ({
        value: buku.id_buku.toString(),
        label: `${buku.judul} (Stok: ${buku.stok})`,
    }));

    const handleLoanDateChange = (date: string) => {
        setData((prev) => ({
            ...prev,
            tanggal_pinjam: date,
            tanggal_jatuh_tempo: calculateDueDate(date),
        }));
    };

    const handleAddBook = () => {
        const newBooks = [...selectedBooks, ''];
        setSelectedBooks(newBooks);
        setData('buku_ids', newBooks);
    };

    const handleRemoveBook = (index: number) => {
        const newBooks = selectedBooks.filter((_, i) => i !== index);
        setSelectedBooks(newBooks);
        setData('buku_ids', newBooks);
    };

    const handleBookChange = (index: number, value: string) => {
        const newBooks = [...selectedBooks];
        newBooks[index] = value;
        setSelectedBooks(newBooks);
        setData('buku_ids', newBooks);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const url = isEditing ? route('peminjaman.update', peminjaman?.id_peminjaman) : route('peminjaman.store');

        post(url, {
            onSuccess: () => {
                if (!isEditing) {
                    reset();
                    setSelectedBooks(['']);
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isReadonly ? 'Detail Peminjaman' : isEditing ? 'Edit Peminjaman' : 'Tambah Peminjaman'} />

            <div className="space-y-6 p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {isReadonly ? 'Detail Peminjaman' : isEditing ? 'Edit Peminjaman' : 'Tambah Peminjaman'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isReadonly
                                ? 'Menampilkan detail peminjaman yang sudah dikembalikan'
                                : isEditing
                                  ? 'Perbarui informasi peminjaman'
                                  : 'Buat peminjaman buku baru'}
                        </p>
                        {isReadonly && (
                            <div className="mt-2">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    ✓ Sudah Dikembalikan
                                </span>
                            </div>
                        )}
                    </div>

                    <Button asChild variant="outline">
                        <Link href={route('peminjaman.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Readonly message */}
                {isReadonly && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Peminjaman Sudah Dikembalikan</h3>
                                <div className="mt-2 text-sm text-green-700">
                                    <p>Data peminjaman ini sudah dikembalikan dan tidak dapat diubah.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {isReadonly ? 'Detail Informasi Peminjaman' : isEditing ? 'Edit Informasi Peminjaman' : 'Informasi Peminjaman'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Pilih Anggota */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="id_anggota" required={!isReadonly}>
                                            Anggota
                                        </Label>
                                        <Combobox
                                            options={anggotaOptions}
                                            value={data.id_anggota}
                                            onValueChange={(value) => !isReadonly && setData('id_anggota', value)}
                                            placeholder="Pilih anggota..."
                                            searchPlaceholder="Cari anggota..."
                                            emptyMessage="Anggota tidak ditemukan"
                                            className={errors.id_anggota ? 'border-destructive' : ''}
                                            disabled={isReadonly}
                                        />
                                        {errors.id_anggota && <p className="mt-1 text-sm text-destructive">{errors.id_anggota}</p>}
                                    </div>

                                    {/* Tanggal Pinjam */}
                                    <div>
                                        <Label htmlFor="tanggal_pinjam" required={!isReadonly}>
                                            Tanggal Pinjam
                                        </Label>
                                        <Input
                                            id="tanggal_pinjam"
                                            type="date"
                                            value={data.tanggal_pinjam}
                                            onChange={(e) => !isReadonly && handleLoanDateChange(e.target.value)}
                                            className={errors.tanggal_pinjam ? 'border-destructive' : ''}
                                            readOnly={isReadonly}
                                        />
                                        {errors.tanggal_pinjam && <p className="mt-1 text-sm text-destructive">{errors.tanggal_pinjam}</p>}
                                    </div>

                                    {/* Tanggal Jatuh Tempo */}
                                    <div>
                                        <Label htmlFor="tanggal_jatuh_tempo" required={!isReadonly}>
                                            Tanggal Jatuh Tempo
                                        </Label>
                                        <Input
                                            id="tanggal_jatuh_tempo"
                                            type="date"
                                            value={data.tanggal_jatuh_tempo}
                                            onChange={(e) => !isReadonly && setData('tanggal_jatuh_tempo', e.target.value)}
                                            className={errors.tanggal_jatuh_tempo ? 'border-destructive' : ''}
                                            readOnly={isReadonly}
                                        />
                                        {errors.tanggal_jatuh_tempo && <p className="mt-1 text-sm text-destructive">{errors.tanggal_jatuh_tempo}</p>}
                                    </div>

                                    {/* Tanggal Kembali dan Denda (hanya tampil jika sudah dikembalikan) */}
                                    {isReturned && (
                                        <>
                                            <div>
                                                <Label htmlFor="tanggal_kembali">Tanggal Pengembalian</Label>
                                                <Input id="tanggal_kembali" type="date" value={data.tanggal_kembali} readOnly className="bg-muted" />
                                            </div>
                                            <div>
                                                <Label htmlFor="denda">Denda</Label>
                                                <Input
                                                    id="denda"
                                                    type="text"
                                                    value={`Rp ${data.denda.toLocaleString('id-ID')}`}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Tanggal Kembali (untuk edit) */}
                                    {/* {isEditing && (
                                        <div>
                                            <Label htmlFor="tanggal_kembali">Tanggal Kembali</Label>
                                            <Input
                                                id="tanggal_kembali"
                                                type="date"
                                                value={data.tanggal_kembali}
                                                onChange={(e) => setData('tanggal_kembali', e.target.value)}
                                                className={errors.tanggal_kembali ? 'border-destructive' : ''}
                                            />
                                            {errors.tanggal_kembali && <p className="mt-1 text-sm text-destructive">{errors.tanggal_kembali}</p>}
                                        </div>
                                    )} */}

                                    {/* Status (untuk edit) */}
                                    {/* {isEditing && (
                                        <div>
                                            <Label htmlFor="status" required>
                                                Status
                                            </Label>
                                            <select
                                                id="status"
                                                value={data.status}
                                                onChange={(e) => setData('status', e.target.value)}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="dipinjam">Dipinjam</option>
                                                <option value="dikembalikan">Dikembalikan</option>
                                                <option value="terlambat">Terlambat</option>
                                            </select>
                                            {errors.status && <p className="mt-1 text-sm text-destructive">{errors.status}</p>}
                                        </div>
                                    )} */}

                                    {/* Denda (untuk edit) */}
                                    {/* {isEditing && (
                                        <div>
                                            <Label htmlFor="denda">Denda (Rp)</Label>
                                            <Input
                                                id="denda"
                                                type="number"
                                                min="0"
                                                value={data.denda}
                                                onChange={(e) => setData('denda', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className={errors.denda ? 'border-destructive' : ''}
                                            />
                                            {errors.denda && <p className="mt-1 text-sm text-destructive">{errors.denda}</p>}
                                        </div>
                                    )} */}
                                </div>

                                {/* Pilih Buku */}
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <Label required={!isReadonly}>Buku yang Dipinjam</Label>
                                        {!isReadonly && (
                                            <Button type="button" variant="outline" size="sm" onClick={handleAddBook}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Tambah Buku
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {selectedBooks.map((bookId, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <Combobox
                                                        options={bukuOptions}
                                                        value={bookId}
                                                        onValueChange={(value) => !isReadonly && handleBookChange(index, value)}
                                                        placeholder="Pilih buku..."
                                                        searchPlaceholder="Cari buku..."
                                                        emptyMessage="Buku tidak ditemukan"
                                                        disabled={isReadonly}
                                                    />
                                                </div>
                                                {selectedBooks.length > 1 && !isReadonly && (
                                                    <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveBook(index)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.buku_ids && <p className="mt-1 text-sm text-destructive">{errors.buku_ids}</p>}
                                </div>

                                {/* Catatan */}
                                <div>
                                    <Label htmlFor="catatan">Catatan</Label>
                                    <Textarea
                                        id="catatan"
                                        value={data.catatan}
                                        onChange={(e) => !isReadonly && setData('catatan', e.target.value)}
                                        placeholder={isReadonly ? 'Tidak ada catatan' : 'Catatan tambahan (opsional)'}
                                        rows={3}
                                        className={errors.catatan ? 'border-destructive' : isReadonly ? 'bg-muted' : ''}
                                        readOnly={isReadonly}
                                    />
                                    {errors.catatan && <p className="mt-1 text-sm text-destructive">{errors.catatan}</p>}
                                </div>

                                {/* Submit Button */}
                                {!isReadonly && (
                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing} className="flex-1">
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? isEditing
                                                    ? 'Memperbarui...'
                                                    : 'Menyimpan...'
                                                : isEditing
                                                  ? 'Perbarui Peminjaman'
                                                  : 'Simpan Peminjaman'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

export default FormPeminjaman;
