import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className
}: StatsCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-muted-foreground truncate">
                                {title}
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-foreground">
                                    {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                                </div>
                                {trend && (
                                    <div
                                        className={cn(
                                            "ml-2 flex items-baseline text-sm font-semibold",
                                            trend.isPositive ? "text-green-600" : "text-red-600"
                                        )}
                                    >
                                        {trend.isPositive ? "+" : ""}
                                        {trend.value}%
                                    </div>
                                )}
                            </dd>
                            {description && (
                                <dd className="text-sm text-muted-foreground mt-1">
                                    {description}
                                </dd>
                            )}
                        </dl>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
