import * as React from "react";
import { ChevronDown, ChevronUp, Search, RotateCcw, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Column definition interface
export interface DataTableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
    key: keyof T;
    header: string;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
    searchable?: boolean;
    className?: string;
    headerClassName?: string;
}

// Sort configuration
interface SortConfig<T> {
    key: keyof T;
    direction: 'asc' | 'desc';
}

interface DataTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
    data: T[];
    columns: DataTableColumn<T>[];
    title?: string;
    description?: string;
    searchPlaceholder?: string;
    showSearch?: boolean;
    showColumnToggle?: boolean;
    showPagination?: boolean;
    pageSize?: number;
    emptyState?: {
        icon?: React.ReactNode;
        title: string;
        description?: string;
        action?: React.ReactNode;
    };
    toolbar?: React.ReactNode;
    onRowClick?: (item: T) => void;
    rowClassName?: string | ((item: T) => string);
}

export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    title,
    description,
    searchPlaceholder = "Cari data...",
    showSearch = true,
    showColumnToggle = true,
    showPagination = true,
    pageSize = 10,
    emptyState,
    toolbar,
    onRowClick,
    rowClassName,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [sortConfig, setSortConfig] = React.useState<SortConfig<T> | null>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [visibleColumns, setVisibleColumns] = React.useState<Set<keyof T>>(
        new Set(columns.map(col => col.key))
    );

    // Filter data based on search
    const filteredData = React.useMemo(() => {
        if (!searchQuery.trim()) return data;

        return data.filter((item) => {
            return columns.some((column) => {
                if (column.searchable === false) return false;

                const value = item[column.key];
                if (value == null) return false;

                return String(value).toLowerCase().includes(searchQuery.toLowerCase());
            });
        });
    }, [data, searchQuery, columns]);

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortConfig) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal == null) return 1;
            if (bVal == null) return -1;

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Paginate data
    const { paginatedData, totalPages, startIndex, endIndex } = React.useMemo(() => {
        if (!showPagination) {
            return {
                paginatedData: sortedData,
                totalPages: 1,
                startIndex: 0,
                endIndex: sortedData.length,
            };
        }

        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        return {
            paginatedData: sortedData.slice(start, end),
            totalPages: Math.ceil(sortedData.length / pageSize),
            startIndex: start,
            endIndex: Math.min(end, sortedData.length),
        };
    }, [sortedData, currentPage, pageSize, showPagination]);

    // Handle sorting
    const handleSort = (key: keyof T) => {
        const column = columns.find(col => col.key === key);
        if (!column?.sortable) return;

        setSortConfig(current => {
            if (current?.key === key) {
                if (current.direction === 'asc') {
                    return { key, direction: 'desc' };
                } else {
                    return null; // Remove sorting
                }
            }
            return { key, direction: 'asc' };
        });
    };

    // Reset filters
    const resetFilters = () => {
        setSearchQuery("");
        setSortConfig(null);
        setCurrentPage(1);
    };

    // Toggle column visibility
    const toggleColumn = (key: keyof T) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    // Get visible columns
    const visibleColumnsArray = columns.filter(col => visibleColumns.has(col.key));

    // Pagination handlers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const hasFilters = searchQuery.length > 0 || sortConfig !== null;

    return (
        <Card>
            {(title || description) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </CardHeader>
            )}

            <CardContent>
                {/* Toolbar Section */}
                {(showSearch || showColumnToggle || toolbar) && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex flex-1 items-center space-x-2">
                            {/* Search Input */}
                            {showSearch && (
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-8 max-w-sm"
                                    />
                                </div>
                            )}

                            {/* Reset Button */}
                            {hasFilters && (
                                <Button
                                    variant="ghost"
                                    onClick={resetFilters}
                                    className="h-8 px-2 lg:px-3"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                            )}

                            {/* Custom Toolbar */}
                            {toolbar}
                        </div>

                        {/* Column Toggle */}
                        {showColumnToggle && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-auto">
                                        Kolom <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {columns.map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={String(column.key)}
                                            className="capitalize"
                                            checked={visibleColumns.has(column.key)}
                                            onCheckedChange={() => toggleColumn(column.key)}
                                        >
                                            {column.header}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumnsArray.map((column) => (
                                    <TableHead
                                        key={String(column.key)}
                                        className={cn(
                                            column.headerClassName,
                                            column.sortable && "cursor-pointer select-none"
                                        )}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                    >
                                        <div className="flex items-center">
                                            {column.header}
                                            {column.sortable && (
                                                <div className="ml-2">
                                                    {sortConfig?.key === column.key ? (
                                                        sortConfig.direction === 'asc' ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )
                                                    ) : (
                                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length ? (
                                paginatedData.map((item, index) => {
                                    const rowClass = typeof rowClassName === 'function'
                                        ? rowClassName(item)
                                        : rowClassName;

                                    return (
                                        <TableRow
                                            key={index}
                                            className={cn(
                                                onRowClick && "cursor-pointer hover:bg-muted/50",
                                                rowClass
                                            )}
                                            onClick={() => onRowClick?.(item)}
                                        >
                                            {visibleColumnsArray.map((column) => (
                                                <TableCell
                                                    key={String(column.key)}
                                                    className={column.className}
                                                >
                                                    {column.cell
                                                        ? column.cell(item)
                                                        : String(item[column.key] ?? '')
                                                    }
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={visibleColumnsArray.length}
                                        className="h-24 text-center"
                                    >
                                        {emptyState ? (
                                            <div className="flex flex-col items-center gap-2 py-8">
                                                {emptyState.icon}
                                                <h3 className="text-lg font-medium">
                                                    {emptyState.title}
                                                </h3>
                                                {emptyState.description && (
                                                    <p className="text-muted-foreground">
                                                        {emptyState.description}
                                                    </p>
                                                )}
                                                {emptyState.action}
                                            </div>
                                        ) : (
                                            "Tidak ada data."
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {showPagination && totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan {startIndex + 1}-{endIndex} dari{" "}
                            {sortedData.length} data
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Sebelumnya
                            </Button>

                            <div className="flex items-center space-x-1">
                                <span className="text-sm text-muted-foreground">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}

                {/* Info when pagination is disabled */}
                {!showPagination && sortedData.length > 0 && (
                    <div className="py-4">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan semua {sortedData.length} data
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
