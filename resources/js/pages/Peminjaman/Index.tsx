import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreVertical, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ReturnModal } from '@/components/ui/return-modal';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Manajemen Peminjaman',
        href: '',
    },
];

type Peminjaman = {
    id_peminjaman: number;
    tanggal_pinjam: string;
    tanggal_jatuh_tempo: string;
    tanggal_kembali?: string;
    status: string;
    denda?: number;
    nama_anggota: string;
};

type PeminjamanIndexProps = {
    peminjaman: Peminjaman[];
};

function PeminjamanIndex({ peminjaman }: PeminjamanIndexProps) {
    const [returnModal, setReturnModal] = useState<{
        isOpen: boolean;
        peminjaman: Peminjaman | null;
    }>({
        isOpen: false,
        peminjaman: null,
    });

    const deleteDialog = useConfirmDialog<Peminjaman>({
        onConfirm: async (item) => {
            if (item) {
                router.delete(route('peminjaman.destroy', item.id_peminjaman), {
                    preserveScroll: true,
                });
            }
        },
    });

    const showReturnModal = (item: Peminjaman) => {
        setReturnModal({
            isOpen: true,
            peminjaman: item,
        });
    };

    const hideReturnModal = () => {
        setReturnModal({
            isOpen: false,
            peminjaman: null,
        });

        // Small timeout to ensure modal is properly unmounted
        setTimeout(() => {
            document.body.style.pointerEvents = 'auto';
        }, 100);
    };

    // Define columns for DataTable
    const columns: DataTableColumn<Peminjaman>[] = [
        {
            key: 'nama_anggota',
            header: 'Peminjam',
            cell: (item) => item.nama_anggota,
            className: 'font-medium',
            sortable: false,
            searchable: true,
        },
        {
            key: 'tanggal_pinjam',
            header: 'Tanggal Pinjam',
            cell: (item) => new Date(item.tanggal_pinjam).toLocaleDateString('id-ID'),
            className: '',
            sortable: true,
            searchable: false,
        },
        {
            key: 'tanggal_jatuh_tempo',
            header: 'Jatuh Tempo',
            cell: (item) => new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID'),
            className: '',
            sortable: true,
            searchable: false,
        },
        {
            key: 'status',
            header: 'Status',
            cell: (item) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                        item.status === 'dipinjam'
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 'dikembalikan'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                    }`}
                >
                    {item.status}
                </span>
            ),
            className: 'w-28',
            sortable: true,
            searchable: true,
        },
        {
            key: 'denda',
            header: 'Denda',
            cell: (item) => (item.denda && item.denda > 0 ? `Rp ${item.denda.toLocaleString('id-ID')}` : '-'),
            className: 'w-24',
            sortable: true,
            searchable: false,
        },
        {
            key: 'id_peminjaman', // Use 'id' as key to avoid duplicate key issues
            header: 'Aksi',
            cell: (item) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {item.status === 'dipinjam' && (
                            <DropdownMenuItem onClick={() => showReturnModal(item)}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Kembalikan
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                            <Link href={route('peminjaman.edit', item.id_peminjaman)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteDialog.showConfirm(item)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: 'w-20',
            sortable: false,
            searchable: false,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Peminjaman Buku" />

            <div className="space-y-6 p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Peminjaman Buku</h1>
                    </div>

                    <Button asChild>
                        <Link href={route('peminjaman.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Peminjaman
                        </Link>
                    </Button>
                </div>

                {/* DataTable */}
                <DataTable
                    data={peminjaman}
                    columns={columns}
                    title="Daftar Peminjaman"
                    description={`Menampilkan ${peminjaman.length} peminjaman dalam sistem`}
                    searchPlaceholder="Cari nama peminjam..."
                    showSearch={true}
                    showColumnToggle={true}
                    showPagination={true}
                    pageSize={10}
                    emptyState={{
                        icon: <Search className="h-8 w-8 text-muted-foreground" />,
                        title: 'Belum ada peminjaman',
                        description: 'Mulai dengan menambahkan peminjam ke dalam sistem.',
                        action: (
                            <Button asChild variant="outline">
                                <Link href={route('peminjaman.create')}>Tambah Peminjam Pertama</Link>
                            </Button>
                        ),
                    }}
                />
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteDialog.isOpen}
                onOpenChange={deleteDialog.hideConfirm}
                onConfirm={deleteDialog.handleConfirm}
                title="Konfirmasi Hapus"
                description={`Apakah Anda yakin ingin menghapus peminjaman ID ${deleteDialog.item?.id_peminjaman}? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="destructive"
                isLoading={deleteDialog.isLoading}
            />

            {/* Return Modal */}
            {returnModal.isOpen && (
                <ReturnModal
                    key={`return-modal-${returnModal.peminjaman?.id_peminjaman}`}
                    open={returnModal.isOpen}
                    onOpenChange={(open) => {
                        if (!open) {
                            hideReturnModal();
                        }
                    }}
                    peminjaman={returnModal.peminjaman}
                    onConfirm={() => {
                        hideReturnModal();
                    }}
                />
            )}
        </AppLayout>
    );
}

export default PeminjamanIndex;
