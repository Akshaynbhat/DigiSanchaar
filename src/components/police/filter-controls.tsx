
"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export function FilterControls() {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select defaultValue="all-districts">
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by District" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all-districts">All Districts</SelectItem>
                    <SelectItem value="new-delhi">New Delhi</SelectItem>
                    <SelectItem value="north-delhi">North Delhi</SelectItem>
                    <SelectItem value="south-delhi">South Delhi</SelectItem>
                    <SelectItem value="central-delhi">Central Delhi</SelectItem>
                </SelectContent>
            </Select>
            <Select defaultValue="24h">
                <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter by Time" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline">
                <Filter className="mr-2 size-4" />
                Apply Filters
            </Button>
        </div>
    );
}
