
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const contactGroups = [
    {
        category: "All-in-One Emergency",
        contacts: [
            { name: "All-in-One Emergency Number", number: "112", description: "The single, integrated emergency number for Police, Fire, and Ambulance services across India." },
        ]
    },
    {
        category: "Core Emergency Services",
        contacts: [
            { name: "Police", number: "100", description: "For direct access to the Police Control Room for any law and order issue or crime." },
            { name: "Fire and Rescue Services", number: "101", description: "For emergencies related to fires." },
            { name: "Ambulance / Medical Emergency", number: "108", description: "For any health emergency requiring an ambulance." },
        ]
    },
    {
        category: "Specific National Helplines",
        contacts: [
            { name: "Women's Helpline", number: "1091", description: "For any woman facing harassment, domestic violence, or any other distress." },
            { name: "Women's Helpline (Sakhi)", number: "181", description: "Provides integrated support and assistance to women affected by violence." },
            { name: "Child Helpline", number: "1098", description: "For reporting any child in distress, or for issues related to child abuse and child rights." },
            { name: "National Cyber Crime Helpline", number: "1930", description: "To report any form of cybercrime, including financial fraud." },
            { name: "Senior Citizens' Helpline", number: "14567", description: "Provides information, guidance, and emotional support to senior citizens." },
        ]
    },
    {
        category: "Disaster Management",
        contacts: [
            { name: "District Disaster Management", number: "1077", description: "For local emergencies like flooding, building collapses, etc., at the district level." },
            { name: "State Disaster Management", number: "1070", description: "For state-level disaster response coordination." },
        ]
    }
];

export function ImportantContactsDialog({ children }: { children: React.ReactNode }) {
    return (
         <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-lg">
                 <DialogHeader>
                    <DialogTitle className="font-headline">Important National Helplines</DialogTitle>
                    <DialogDescription>
                        Quick access to key emergency helpline numbers in India.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
                    <div className="space-y-6">
                        {contactGroups.map((group) => (
                            <div key={group.category} className="space-y-3">
                                <h3 className="font-semibold text-foreground">{group.category}</h3>
                                {group.contacts.map(contact => (
                                    <div key={contact.name} className="flex items-start justify-between p-3 border rounded-lg">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium">{contact.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{contact.description}</p>
                                        </div>
                                        <a href={`tel:${contact.number}`} className="font-mono text-lg text-primary font-bold tracking-wider hover:underline">
                                            {contact.number}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
