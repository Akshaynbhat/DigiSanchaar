
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { firstAidData, type FirstAidTopic } from "@/lib/first-aid-data";
import { LifeBuoy } from "lucide-react";

export default function MedicalAidPage() {
    const [selectedTopic, setSelectedTopic] = useState<FirstAidTopic | null>(firstAidData[0]);

    const handleTopicChange = (topicKey: string) => {
        const topic = firstAidData.find(t => t.key === topicKey) || null;
        setSelectedTopic(topic);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2"><LifeBuoy /> Medical First Aid</h1>
                <p className="text-muted-foreground">Quick, step-by-step guides for common medical emergencies. This is not a substitute for professional medical advice.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select a Medical Issue</CardTitle>
                    <CardDescription>Choose a topic from the dropdown to see the first-aid instructions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleTopicChange} defaultValue={selectedTopic?.key}>
                        <SelectTrigger className="w-full sm:w-[320px]">
                            <SelectValue placeholder="Select a medical topic..." />
                        </SelectTrigger>
                        <SelectContent>
                            {firstAidData.map(topic => (
                                <SelectItem key={topic.key} value={topic.key}>{topic.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedTopic && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">{selectedTopic.title}</CardTitle>
                         {selectedTopic.importantNote && (
                            <CardDescription className="text-destructive font-semibold pt-2">{selectedTopic.importantNote}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full" defaultValue={selectedTopic.steps.map((_, i) => `item-${i}`)}>
                            {selectedTopic.steps.map((step, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-lg font-semibold">Step {index + 1}</AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                                        {step}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
