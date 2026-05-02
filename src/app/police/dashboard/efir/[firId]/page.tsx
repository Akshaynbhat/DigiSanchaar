
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RealTimeMap } from "@/components/police/real-time-map";
import { AlertTriangle, Clock, FileText, User, Phone, MapPin, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleData = {
    reportId: "EFIR2025-00123",
    incidentType: "Missing Person",
    location: "Cubbon Park, Bengaluru, Karnataka",
    dateMissing: "18-Sep-2025, 4:30 PM",
    audioProof: "audio123.mp3",
    missingPerson: {
        name: "Rohit Sharma",
        fatherName: "Anil Sharma",
        gender: "Male",
        age: 24,
        contact: "9876543210",
        appearance: "5'8\", 70kg, Fair, Blue T-shirt, Black Jeans, White Shoes",
        photoUrl: "https://storage.googleapis.com/project-os-frontend-prod.appspot.com/1739501532059_48943481.png",
        address: "12, MG Road, Bengaluru",
        district: "Bengaluru Urban",
    },
    reporter: {
        name: "Priya Sharma",
        relationship: "Sister",
        contact: "9876501234",
    },
    liveData: {
        lastKnownLocation: { lat: 12.9716, lng: 77.5946 },
        sosTriggered: "Yes",
        alertHistory: "SOS Triggered at 4:45 PM, Audio proof uploaded at 4:47 PM",
    }
};

const DetailRow = ({ label, value }: { label: string, value: string | number }) => (
    <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

export default function FirDetailPage({ params }: { params: { firId: string }}) {

    const { reportId, incidentType, location, dateMissing, missingPerson, reporter, liveData, audioProof } = sampleData;

    return (
        <div className="mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
            <header className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <p className="font-mono text-primary">{reportId}</p>
                        <h1 className="text-3xl font-bold font-headline">First Information Report (E-FIR)</h1>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">{incidentType}</p>
                        <p className="text-sm text-muted-foreground">{location}</p>
                    </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground"/>
                        <strong>Date & Time of Incident:</strong>
                        <span>{dateMissing}</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertTriangle className="size-4" />
                        <span>SOS Triggered: {liveData.sosTriggered}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Missing Person Details</CardTitle></CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-6">
                             <Avatar className="h-32 w-32 border">
                                <AvatarImage src={missingPerson.photoUrl} alt={missingPerson.name} />
                                <AvatarFallback>{missingPerson.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 flex-1">
                                <DetailRow label="Name" value={missingPerson.name} />
                                <DetailRow label="Father's Name" value={missingPerson.fatherName} />
                                <DetailRow label="Age" value={missingPerson.age} />
                                <DetailRow label="Gender" value={missingPerson.gender} />
                                <DetailRow label="Contact" value={missingPerson.contact} />
                                <DetailRow label="District" value={missingPerson.district} />
                                <div className="col-span-2 sm:col-span-3">
                                    <DetailRow label="Address" value={missingPerson.address} />
                                </div>
                                 <div className="col-span-2 sm:col-span-3">
                                    <DetailRow label="Appearance" value={missingPerson.appearance} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Reporter Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <DetailRow label="Name" value={reporter.name} />
                            <DetailRow label="Relationship" value={reporter.relationship} />
                            <DetailRow label="Contact" value={reporter.contact} />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Last Known Location</CardTitle></CardHeader>
                        <CardContent className="aspect-square">
                            <RealTimeMap tourists={[{ id: '1', name: missingPerson.name, status: 'distress', ...liveData.lastKnownLocation }]} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Mic /> Evidence</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm"><strong>Alert History:</strong> {liveData.alertHistory}</p>
                            <div>
                               <p className="text-sm font-medium">SOS Audio Recording</p>
                                <audio controls className="w-full mt-2">
                                    <source src="/beep.mp3" type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                                <p className="text-xs text-muted-foreground text-center mt-1">File: {audioProof}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
