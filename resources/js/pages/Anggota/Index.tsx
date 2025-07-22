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
        title: 'Manajemen Anggota',
        href: '',
    },
];
type Anggota = {
    id: number;
    name: string;
    email: string;
    telepon: string;
};

type AnggotaIndexPageProps = {
    anggota: Anggota[];
};

function AnggotaIndexPage({ anggota }: AnggotaIndexPageProps) {
    const deleteDialog = useConfirmDialog<Anggota>({
        onConfirm: async (item) => {
            if (item) {
                router.delete(route('anggota.destroy', item.id), {
                    preserveScroll: true,
                });
            }
        },
    });

    // Define columns for DataTable
    const columns: DataTableColumn<Anggota>[] = [
        {
            key: 'name',
            header: 'Nama',
            className: 'font-medium',
            sortable: true,
            searchable: true,
        },
        {
            key: 'email',
            header: 'Email',
            sortable: true,
            searchable: true,
        },
        {
            key: 'telepon',
            header: 'Telepon',
            sortable: true,
            searchable: true,
        },
        {
            key: 'id', // Use 'id' as key to avoid duplicate key issues
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
                            <Link href={route('anggota.edit', item.id)}>
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
            <Head title="Manajemen Anggota" />

            <div className="space-y-6 p-5">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Manajemen Anggota</h1>
                    </div>

                    <Button asChild>
                        <Link href={route('anggota.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Anggota
                        </Link>
                    </Button>
                </div>

                {/* DataTable */}
                <DataTable
                    data={anggota}
                    columns={columns}
                    title="Daftar Anggota"
                    description={`Menampilkan ${anggota.length} anggota dalam sistem`}
                    searchPlaceholder="Cari berdasarkan nama, email, atau telepon..."
                    showSearch={true}
                    showColumnToggle={true}
                    showPagination={true}
                    pageSize={10}
                    emptyState={{
                        icon: <Search className="h-8 w-8 text-muted-foreground" />,
                        title: 'Belum ada anggota',
                        description: 'Mulai dengan menambahkan anggota.',
                        action: (
                            <Button asChild variant="outline">
                                <Link href={route('anggota.create')}>Tambah Anggota Pertama</Link>
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
                description={`Apakah Anda yakin ingin menghapus "${deleteDialog.item?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="destructive"
                isLoading={deleteDialog.isLoading}
            />
        </AppLayout>
    );
}

export default AnggotaIndexPage;
