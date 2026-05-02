
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Clock } from "lucide-react";

type AlertItem = {
    id: string;
    touristName: string;
    type: string;
    location: string;
    time: string;
    status: 'High' | 'Medium' | 'Low';
};

type AlertListProps = {
    alerts: AlertItem[];
};

export function AlertList({ alerts }: AlertListProps) {

    const getStatusVariant = (status: AlertItem['status']) => {
        switch (status) {
            case 'High': return 'destructive';
            case 'Medium': return 'default';
            case 'Low': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-4">
            {alerts.length === 0 ? (
                 <p className="text-sm text-muted-foreground text-center py-8">No active alerts.</p>
            ): (
                alerts.map(alert => (
                    <div key={alert.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="flex justify-between items-start">
                            <h4 className="font-semibold">{alert.type}</h4>
                             <Badge variant={getStatusVariant(alert.status)}>{alert.status}</Badge>
                        </div>
                        <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2"><User className="size-4" /> {alert.touristName}</p>
                            <p className="flex items-center gap-2"><MapPin className="size-4" /> {alert.location}</p>
                            <p className="flex items-center gap-2"><Clock className="size-4" /> {alert.time}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
