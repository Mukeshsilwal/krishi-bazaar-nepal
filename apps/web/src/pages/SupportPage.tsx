import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import api from '@/services/api';
import { FEEDBACK_ENDPOINTS } from '@/config/endpoints';
import { MessageSquare, Send } from 'lucide-react';

const SupportPage = () => {
    const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            const res = await api.post(FEEDBACK_ENDPOINTS.BASE, data);
            if (res.data.success) {
                toast.success("Feedback submitted successfully!");
                reset();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit feedback");
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-6 w-6 text-primary" />
                        <CardTitle>Help & Support</CardTitle>
                    </div>
                    <CardDescription>
                        Have a suggestion or facing an issue? Let us know.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Feedback Type</Label>
                            <Select onValueChange={(val) => setValue('type', val)} defaultValue="ISSUE">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ISSUE">Report an Issue</SelectItem>
                                    <SelectItem value="SUGGESTION">Suggestion</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                {...register('message', { required: "Message is required" })}
                                placeholder="Describe your issue or suggestion..."
                                className="min-h-[150px]"
                            />
                            {errors.message && <span className="text-red-500 text-sm">{errors.message.message?.toString()}</span>}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            <Send className="mr-2 h-4 w-4" />
                            {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupportPage;
