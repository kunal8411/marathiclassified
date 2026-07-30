import type { AdminAnalytics } from "@/services/admin.service";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardsProps = {
  data: AdminAnalytics;
  className?: string;
};

export function StatCards({ data, className }: StatCardsProps) {
  const pending = data.adsByStatus.pending ?? 0;
  const active = data.adsByStatus.active ?? 0;

  const stats = [
    { label: "Users", value: data.users },
    { label: "Active ads", value: active },
    { label: "Pending review", value: pending },
    { label: "Open reports", value: data.openReports },
    { label: "Messages today", value: data.messagesToday },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{stat.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
