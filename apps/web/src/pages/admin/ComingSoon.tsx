import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Hammer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ComingSoonProps {
    title?: string;
    description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
    title = "Under Construction",
    description = "This module is currently being built. Please check back later."
}) => {
    const navigate = useNavigate();

    return (
        <div className="flex h-[80vh] w-full items-center justify-center p-4">
            <Card className="w-full max-w-md text-center border-dashed">
                <CardContent className="pt-10 pb-10 space-y-6">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                            <Hammer className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Go Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComingSoon;
