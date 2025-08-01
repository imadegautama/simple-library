import { Head, Link, router } from '@inertiajs/react';
import { Edit, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Manajemen Buku',
        href: '',
    },
];

type Buku = {
    id_buku: number;
    judul: string;
    penulis: string;
    isbn: string;
    stok: number;
};

type BukuIndexPageProps = {
    buku: Buku[];
};

function BukuIndexPage({ buku }: BukuIndexPageProps) {
    const deleteDialog = useConfirmDialog<Buku>({
        onConfirm: async (item) => {
            if (item) {
                router.delete(route('buku.destroy', item.id_buku), {
                    preserveScroll: true,
                });
            }
        },
    });

    // Define columns for DataTable
    const columns: DataTableColumn<Buku>[] = [
        {
            key: 'judul',
            header: 'Judul',
            className: 'font-medium',
            sortable: true,
            searchable: true,
        },
        {
            key: 'penulis',
            header: 'Penulis',
            sortable: true,
            searchable: true,
        },
        {
            key: 'isbn',
            header: 'ISBN',
            sortable: true,
            searchable: true,
        },
        {
            key: 'stok',
            header: 'Stok',
            cell: (item) => `${item.stok}`,
            sortable: true,
            searchable: false,
        },
        {
            key: 'id_buku', // Use 'id' as key to avoid duplicate key issues
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
                        <DropdownMenuItem asChild>
                            <Link href={route('buku.edit', item.id_buku)}>
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
            <Head title="Manajemen Buku" />

            <div className="space-y-6 p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Manajemen Buku</h1>
                    </div>

                    <Button asChild>
                        <Link href={route('buku.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Buku
                        </Link>
                    </Button>
                </div>

                {/* DataTable */}
                <DataTable
                    data={buku}
                    columns={columns}
                    title="Daftar Buku"
                    description={`Menampilkan ${buku.length} buku dalam sistem`}
                    searchPlaceholder="Cari berdasarkan judul, penulis, atau kategori..."
                    showSearch={true}
                    showColumnToggle={true}
                    showPagination={true}
                    pageSize={10}
                    emptyState={{
                        icon: <Search className="h-8 w-8 text-muted-foreground" />,
                        title: 'Belum ada buku',
                        description: 'Mulai dengan menambahkan buku pertama ke koleksi perpustakaan.',
                        action: (
                            <Button asChild variant="outline">
                                <Link href={route('buku.create')}>Tambah Buku Pertama</Link>
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
                description={`Apakah Anda yakin ingin menghapus "${deleteDialog.item?.judul}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="destructive"
                isLoading={deleteDialog.isLoading}
            />
        </AppLayout>
    );
}

export default BukuIndexPage;
