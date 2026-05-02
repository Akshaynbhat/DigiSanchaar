
import { RealTimeMap } from "@/components/police/real-time-map";
import { AlertList } from "@/components/police/alert-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Siren } from "lucide-react";
import { FilterControls } from "@/components/police/filter-controls";
import { StatsCards } from "@/components/police/stats-cards";

// Mock data - in a real app, this would come from a live data source (e.g., Firestore)
const mockTourists = [
  { id: 't1', name: 'Ravi Kumar', lat: 28.6139, lng: 77.2090, status: 'safe', district: 'New Delhi' },
  { id: 't2', name: 'Priya Sharma', lat: 28.6120, lng: 77.2150, status: 'safe', district: 'New Delhi' },
  { id: 't3', name: 'Amit Singh', lat: 28.6538, lng: 77.2295, status: 'distress', district: 'North Delhi' },
  { id: 't4', name: 'Sunita Devi', lat: 28.5273, lng: 77.2054, status: 'safe', district: 'South Delhi' },
  { id: 't5', name: 'John Smith', lat: 28.6358, lng: 77.2244, status: 'safe', district: 'Central Delhi' },
];

const mockAlerts = [
  { id: 'a1', touristName: 'Amit Singh', type: 'SOS Button', location: 'Red Fort area', time: '2 mins ago', status: 'High' },
  { id: 'a2', touristName: 'Anjali Mehta', type: 'Distress Pattern', location: 'Connaught Place', time: '15 mins ago', status: 'Medium' },
  { id: 'a3', touristName: 'Vikram Rathore', type: 'Left Safe Zone', location: 'Unknown', time: '1 hour ago', status: 'Low' },
];


export default function PoliceDashboardPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Police Command Center</h1>
                <p className="text-muted-foreground">Real-time tourist safety monitoring</p>
            </div>
            <FilterControls />
        </header>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe />
                        Tourist Location Heatmap
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[calc(100%-4rem)]">
                   <RealTimeMap tourists={mockTourists} />
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Siren className="text-destructive" />
                        Active SOS Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <AlertList alerts={mockAlerts} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
