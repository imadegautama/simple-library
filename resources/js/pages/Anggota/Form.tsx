import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface AnggotaData {
    id?: number;
    name: string;
    email: string;
    telepon: string;
    alamat: string;
}

interface FormProps {
    anggota?: AnggotaData;
    mode?: 'create' | 'edit';
}

type FormDataType = {
    name: string;
    email: string;
    telepon: string;
    alamat: string;
    _method?: string;
};

function FormAnggota({ anggota, mode = 'create' }: FormProps) {
    const isEditing = mode === 'edit' && anggota;

    // Dynamic breadcrumbs based on mode
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Manajemen Anggota',
            href: route('anggota.index'),
        },
        {
            title: isEditing ? 'Edit Anggota' : 'Tambah Anggota',
            href: '',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm<FormDataType>({
        name: anggota?.name || '',
        email: anggota?.email || '',
        telepon: anggota?.telepon || '',
        alamat: anggota?.alamat || '',
        ...(isEditing && { _method: 'PUT' }),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const url = isEditing ? route('anggota.update', anggota?.id) : route('anggota.store');

        post(url, {
            onSuccess: () => {
                if (!isEditing) {
                    reset();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'Edit Anggota' : 'Tambah Anggota'} />

            <div className="space-y-6 p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{isEditing ? 'Edit Anggota' : 'Tambah Anggota'}</h1>
                    </div>

                    <Button asChild variant="outline">
                        <Link href={route('anggota.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Form */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{isEditing ? 'Edit Informasi Anggota' : 'Informasi Anggota'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {/* Nama */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="name" required>
                                            Nama Lengkap
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <Label htmlFor="email" required>
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="contoh@email.com"
                                            className={errors.email ? 'border-destructive' : ''}
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                                    </div>

                                    {/* Telepon */}
                                    <div>
                                        <Label htmlFor="telepon" required>
                                            Telepon
                                        </Label>
                                        <Input
                                            id="telepon"
                                            type="tel"
                                            value={data.telepon}
                                            onChange={(e) => setData('telepon', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className={errors.telepon ? 'border-destructive' : ''}
                                        />
                                        {errors.telepon && <p className="mt-1 text-sm text-destructive">{errors.telepon}</p>}
                                    </div>

                                    {/* Alamat */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="alamat" required>
                                            Alamat
                                        </Label>
                                        <Textarea
                                            id="alamat"
                                            value={data.alamat}
                                            onChange={(e) => setData('alamat', e.target.value)}
                                            placeholder="Masukkan alamat lengkap"
                                            rows={3}
                                            className={errors.alamat ? 'border-destructive' : ''}
                                        />
                                        {errors.alamat && <p className="mt-1 text-sm text-destructive">{errors.alamat}</p>}
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
                                              ? 'Perbarui Anggota'
                                              : 'Simpan Anggota'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

export default FormAnggota;
