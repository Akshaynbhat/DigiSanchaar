
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const sampleEfirData = [
  {
    reportId: "EFIR2025-00123",
    incidentType: "Missing Person",
    missingPersonName: "Rohit Sharma",
    location: "Cubbon Park, Bengaluru",
    dateMissing: "18-Sep-2025",
    status: "Active",
  },
   {
    reportId: "EFIR2025-00122",
    incidentType: "SOS Alert",
    missingPersonName: "Anjali Verma",
    location: "Koramangala, Bengaluru",
    dateMissing: "15-Sep-2025",
    status: "Closed",
  },
];

export default function EFirLogsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">E-FIR Logbook</h1>
        <p className="text-muted-foreground">Review and manage all electronically filed First Information Reports.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filed Reports</CardTitle>
           <CardDescription>
            Showing all active and closed E-FIRs. Click on a report to view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Report ID</TableHead>
                <TableHead>Incident Type</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleEfirData.map((fir) => (
                <TableRow key={fir.reportId}>
                  <TableCell className="font-mono">{fir.reportId}</TableCell>
                  <TableCell>{fir.incidentType}</TableCell>
                  <TableCell className="font-medium">{fir.missingPersonName}</TableCell>
                  <TableCell>{fir.location}</TableCell>
                  <TableCell>{fir.dateMissing}</TableCell>
                  <TableCell>
                    <Badge variant={fir.status === 'Active' ? 'destructive' : 'secondary'}>
                      {fir.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <Link href={`/police/dashboard/efir/${fir.reportId}`}>
                        <Button variant="outline" size="sm">
                            View Report
                            <ChevronRight className="ml-2 size-4" />
                        </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
