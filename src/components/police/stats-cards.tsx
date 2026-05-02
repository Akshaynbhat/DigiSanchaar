
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Siren, ShieldAlert, Map } from "lucide-react";

export function StatsCards() {
    const stats = [
        { title: "Active Tourists", value: "1,204", icon: Users },
        { title: "Active SOS Alerts", value: "3", icon: Siren, color: "text-destructive" },
        { title: "High-Risk Zones", value: "8", icon: ShieldAlert, color: "text-amber-600" },
        { title: "Jurisdictions", value: "4", icon: Map },
    ];
    return (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
