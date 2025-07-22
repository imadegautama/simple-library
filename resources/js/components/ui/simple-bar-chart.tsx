import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartData {
    date: string;
    day: string;
    peminjaman: number;
    pengembalian: number;
}

interface SimpleBarChartProps {
    data: ChartData[];
    title: string;
    className?: string;
}

export function SimpleBarChart({ data, title, className }: SimpleBarChartProps) {
    const maxValue = Math.max(
        ...data.flatMap(d => [d.peminjaman, d.pengembalian])
    ) || 1;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{item.day}</span>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>Pinjam: {item.peminjaman}</span>
                                    <span>Kembali: {item.pengembalian}</span>
                                </div>
                            </div>
                            <div className="flex gap-1 h-6">
                                {/* Bar untuk peminjaman */}
                                <div className="flex-1 bg-gray-200 rounded-l overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-300"
                                        style={{
                                            width: `${item.peminjaman > 0 ? (item.peminjaman / maxValue) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                                {/* Bar untuk pengembalian */}
                                <div className="flex-1 bg-gray-200 rounded-r overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{
                                            width: `${item.pengembalian > 0 ? (item.pengembalian / maxValue) * 100 : 0}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span>Peminjaman</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span>Pengembalian</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
