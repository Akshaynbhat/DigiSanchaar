
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Trash2, PlusCircle, AlertCircle, ShieldAlert, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const reportTheftSchema = z.object({
  theftType: z.string().min(1, "Please select the type of theft."),
  otherTheftType: z.string().optional(),
  incidentDate: z.date({ required_error: "Please select a date." }),
  incidentTime: z.string().min(1, "Please provide an approximate time."),
  locationDetails: z.string().min(1, "Please provide location details."),
  stolenItems: z.array(z.object({
    category: z.string().min(1, "Please select a category."),
    brandModel: z.string().optional(),
    description: z.string().min(1, "Please describe the item."),
    estimatedValue: z.coerce.number().optional(),
    serialNumber: z.string().optional(),
  })).min(1, "Please add at least one stolen item."),
  suspects: z.object({
    count: z.string().optional(),
    gender: z.string().optional(),
    ageRange: z.string().optional(),
    clothing: z.string().optional(),
    distinctiveFeatures: z.array(z.string()).optional(),
    otherFeatures: z.string().optional(),
    transport: z.string().optional(),
  }).optional(),
  narrative: z.string().min(1, "Please describe what happened."),
}).refine(data => {
    if (data.theftType === "Other" && !data.otherTheftType) {
        return false;
    }
    return true;
}, {
    message: "Please specify the 'Other' theft type.",
    path: ["otherTheftType"],
});

type ReportTheftFormValues = z.infer<typeof reportTheftSchema>;

const distinctiveFeaturesList = [
    { id: 'hat', label: 'Hat/Cap' },
    { id: 'glasses', label: 'Glasses' },
    { id: 'beard', label: 'Beard/Mustache' },
    { id: 'tattoos', label: 'Tattoos' },
    { id: 'scars', label: 'Scars' },
];


export default function ReportTheftPage() {
    const { toast } = useToast();
    const { user } = useAuth();
    const form = useForm<ReportTheftFormValues>({
        resolver: zodResolver(reportTheftSchema),
        defaultValues: {
            stolenItems: [{ category: "", description: "", brandModel: "", serialNumber: "" }],
            suspects: {
                distinctiveFeatures: [],
                count: "",
                gender: "",
                ageRange: "",
                clothing: "",
                otherFeatures: "",
                transport: "",
            },
            incidentTime: "",
            locationDetails: "",
            narrative: "",
            otherTheftType: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "stolenItems",
    });
    
    const theftType = form.watch("theftType");

    const onSubmit = async (data: ReportTheftFormValues) => {
        if (!user) {
             toast({
                variant: "destructive",
                title: "Not Logged In",
                description: "You must be logged in to submit a report.",
            });
            return;
        }

        try {
            await addDoc(collection(db, "petty_thefts"), {
                ...data,
                userId: user.uid,
                reporterName: user.displayName || 'N/A',
                createdAt: Timestamp.now(),
                status: 'Submitted',
            });
            
            toast({
                title: "Report Submitted Successfully",
                description: "Your petty theft report has been logged. We will contact you if more information is needed.",
            });
            form.reset();
        } catch (error) {
            console.error("Error submitting theft report: ", error);
             toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was an error saving your report. Please try again.",
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-headline font-bold flex items-center gap-2"><ShieldAlert /> Report a Petty Theft</h1>
                <p className="text-muted-foreground">Fill out the form below to report a minor theft. Please call the police for emergencies.</p>
            </header>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Section 1: Incident Basics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Incident Basics</CardTitle>
                            <CardDescription>What happened, where, and when.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="theftType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type of Theft</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select theft type..." /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Pickpocketing">Pickpocketing</SelectItem>
                                                <SelectItem value="Bag/Purse Snatching">Bag/Purse Snatching</SelectItem>
                                                <SelectItem value="Theft from Vehicle">Theft from Vehicle</SelectItem>
                                                <SelectItem value="Theft of Bicycle/Scooter">Theft of Bicycle/Scooter</SelectItem>
                                                <SelectItem value="Package Theft">Package Theft</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {theftType === "Other" && (
                                 <FormField
                                    control={form.control}
                                    name="otherTheftType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Please Specify</FormLabel>
                                            <FormControl><Input placeholder="e.g., Phone snatching" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                             <FormField
                                control={form.control}
                                name="incidentDate"
                                render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Incident</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="incidentTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Approximate Time of Incident</FormLabel>
                                        <FormControl><Input placeholder="e.g., Around 4:30 PM" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="md:col-span-2">
                                <FormLabel>Location</FormLabel>
                                 <div className="space-y-2 mt-2">
                                     <Button type="button" variant="outline" className="w-full justify-center"><MapPin className="mr-2"/> Use My Current Location</Button>
                                     <FormField
                                        control={form.control}
                                        name="locationDetails"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs text-muted-foreground">Address or Landmark with details</FormLabel>
                                                <FormControl><Textarea placeholder="e.g., Inside the metro station, near the ticket counter..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                 </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Stolen Items */}
                    <Card>
                        <CardHeader>
                             <CardTitle>2. Stolen Items</CardTitle>
                             <CardDescription>List all the items that were taken.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((item, index) => (
                                 <div key={item.id} className="p-4 border rounded-md space-y-4 relative">
                                    <h4 className="font-semibold">Item #{index + 1}</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <FormField
                                            control={form.control}
                                            name={`stolenItems.${index}.category`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Phone">Phone</SelectItem>
                                                            <SelectItem value="Wallet/Purse">Wallet/Purse</SelectItem>
                                                            <SelectItem value="Bag/Backpack">Bag/Backpack</SelectItem>
                                                            <SelectItem value="Laptop/Tablet">Laptop/Tablet</SelectItem>
                                                            <SelectItem value="Jewelry">Jewelry</SelectItem>
                                                            <SelectItem value="Cash">Cash</SelectItem>
                                                            <SelectItem value="Documents">Documents (ID, Passport)</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name={`stolenItems.${index}.brandModel`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Brand & Model</FormLabel>
                                                    <FormControl><Input placeholder="e.g., Apple iPhone 14 Pro" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`stolenItems.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl><Textarea placeholder="e.g., Blue color, scratch on corner" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                         </div>
                                         <FormField
                                            control={form.control}
                                            name={`stolenItems.${index}.estimatedValue`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Estimated Value (₹)</FormLabel>
                                                    <FormControl><Input type="number" placeholder="e.g., 80000" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                          <FormField
                                            control={form.control}
                                            name={`stolenItems.${index}.serialNumber`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Serial Number <span className="text-muted-foreground">(Optional)</span></FormLabel>
                                                    <FormControl><Input placeholder="For electronics" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                     </div>
                                     {index > 0 && <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}><Trash2 className="h-4 w-4"/></Button>}
                                 </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ category: "", description: "", brandModel: "", serialNumber: "" })}><PlusCircle className="mr-2"/> Add Another Item</Button>
                        </CardContent>
                    </Card>
                    
                    {/* Section 3: Suspect Description */}
                    <Card>
                        <CardHeader>
                             <CardTitle>3. Suspect Description (Optional)</CardTitle>
                             <CardDescription>Provide any details you can recall. Skip if you're unsure.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField control={form.control} name="suspects.count" render={({ field }) => (<FormItem><FormLabel>Number of Suspects</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent><SelectItem value="1">1</SelectItem><SelectItem value="2">2</SelectItem><SelectItem value="3">3</SelectItem><SelectItem value="More than 3">More than 3</SelectItem></SelectContent></Select></FormItem>)}/>
                            <FormField control={form.control} name="suspects.gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Unknown">Unknown/Not Sure</SelectItem></SelectContent></Select></FormItem>)}/>
                            <FormField control={form.control} name="suspects.ageRange" render={({ field }) => (<FormItem><FormLabel>Estimated Age Range</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent><SelectItem value="Teenager">Teenager</SelectItem><SelectItem value="20s">20s</SelectItem><SelectItem value="30s">30s</SelectItem><SelectItem value="40+">40+</SelectItem></SelectContent></Select></FormItem>)}/>
                            <FormField control={form.control} name="suspects.clothing" render={({ field }) => (<FormItem className="lg:col-span-3"><FormLabel>Clothing Description</FormLabel><FormControl><Input placeholder="e.g., Red t-shirt, blue jeans" {...field} /></FormControl></FormItem>)}/>
                            
                            <Controller
                                control={form.control}
                                name="suspects.distinctiveFeatures"
                                render={({ field }) => (
                                    <FormItem className="lg:col-span-3">
                                        <FormLabel>Distinctive Features</FormLabel>
                                        <div className="space-y-2">
                                            {distinctiveFeaturesList.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`feature-${item.id}`}
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item.id])
                                                                : field.onChange(field.value?.filter((value) => value !== item.id));
                                                        }}
                                                    />
                                                    <label htmlFor={`feature-${item.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{item.label}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </FormItem>
                                )}
                            />
                             <FormField control={form.control} name="suspects.otherFeatures" render={({ field }) => (<FormItem className="lg:col-span-3"><FormLabel>Other Features</FormLabel><FormControl><Input placeholder="e.g., Limping, specific accent" {...field} /></FormControl></FormItem>)}/>
                             <FormField control={form.control} name="suspects.transport" render={({ field }) => (<FormItem><FormLabel>Mode of Transport</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger></FormControl><SelectContent><SelectItem value="On Foot">On Foot</SelectItem><SelectItem value="Bicycle">Bicycle</SelectItem><SelectItem value="Motorbike/Scooter">Motorbike/Scooter</SelectItem><SelectItem value="Car">Car</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></FormItem>)}/>
                        </CardContent>
                    </Card>

                    {/* Section 4: Narrative */}
                     <Card>
                        <CardHeader>
                             <CardTitle>4. Additional Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="narrative"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Incident Narrative</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what happened in your own words. Include any details that don't fit in the fields above."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 animate-spin"/>}
                            Submit Report
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

    
