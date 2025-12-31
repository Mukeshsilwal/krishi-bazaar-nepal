
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '@/services/api';

const RulePlayground = () => {
    const [conditions, setConditions] = useState('{\n  "crop": "RICE",\n  "stage": "SOWING"\n}');
    const [mockData, setMockData] = useState('{\n  "crop": "RICE",\n  "stage": "SOWING",\n  "soilType": "CLAY"\n}');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = async () => {
        try {
            setError(null);
            const parsedConditions = JSON.parse(conditions);
            const parsedData = JSON.parse(mockData);

            setResult({
                triggered: true,
                matchReason: "Matched all conditions",
                outcome: { advice: "Use Nitrogen fertilizer" }
            });
            // const response = await api.post('/admin/rules/simulate', {
            //     ruleConditions: parsedConditions,
            //     mockFarmerData: parsedData
            // });

            // if (response.data.success) {
            //     setResult(response.data.data);
            // }
        } catch (err) {
            setError('Simulation failed. Check JSON format or API connection.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Advisory Rule Playground</h1>
                <p className="text-muted-foreground">Test and simulate advisory rules with mock data</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Rule Conditions (JSON)</CardTitle>
                        <CardDescription>Define the conditions for the rule</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className="font-mono h-[300px]"
                            value={conditions}
                            onChange={(e) => setConditions(e.target.value)}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mock Farmer Data (JSON)</CardTitle>
                        <CardDescription>Simulate incoming farmer context</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            className="font-mono h-[300px]"
                            value={mockData}
                            onChange={(e) => setMockData(e.target.value)}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center">
                <Button size="lg" onClick={handleSimulate}>
                    <Play className="mr-2 h-5 w-5" />
                    Simulate Evaluation
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {result && (
                <Card className={`border-l-4 ${result.triggered ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-4">
                            {result.triggered ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            ) : (
                                <AlertCircle className="h-6 w-6 text-gray-400" />
                            )}
                            <h3 className={`text-xl font-semibold ${result.triggered ? 'text-green-700' : 'text-gray-700'}`}>
                                Result: {result.triggered ? "TRIGGERED" : "NOT TRIGGERED"}
                            </h3>
                        </div>

                        <div className="space-y-2">
                            <p><strong>Match Reason:</strong> {result.matchReason}</p>
                            {result.outcome && (
                                <div className="mt-4 bg-muted p-4 rounded-md">
                                    <pre className="font-mono text-sm whitespace-pre-wrap">
                                        {JSON.stringify(result.outcome, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RulePlayground;
