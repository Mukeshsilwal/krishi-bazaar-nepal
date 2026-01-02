
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
    const [userId, setUserId] = useState('');
    const [simulationMode, setSimulationMode] = useState<'mock' | 'user'>('mock');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = async () => {
        try {
            setError(null);
            const parsedConditions = JSON.parse(conditions);

            const payload: any = {
                // Auto-detect definition vs simple map
                definition: (parsedConditions.conditions && Array.isArray(parsedConditions.conditions)) ? parsedConditions : undefined,
                ruleConditions: (!parsedConditions.conditions) ? parsedConditions : undefined
            };

            if (simulationMode === 'mock') {
                try {
                    payload.mockFarmerData = JSON.parse(mockData);
                } catch (e) {
                    setError('Invalid JSON in Mock Data');
                    return;
                }
            } else {
                if (!userId) {
                    setError('User ID is required for Real User simulation');
                    return;
                }
                payload.userId = userId;
            }

            const response = await api.post('/admin/rules/simulate', payload);

            if (response.data.success) {
                setResult(response.data.data);
            }
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
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Context Data</CardTitle>
                                <CardDescription>Choose data source for simulation</CardDescription>
                            </div>
                            <div className="flex bg-gray-100 p-1 rounded-md">
                                <button
                                    onClick={() => setSimulationMode('mock')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${simulationMode === 'mock'
                                            ? 'bg-white shadow text-primary'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    Mock JSON
                                </button>
                                <button
                                    onClick={() => setSimulationMode('user')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${simulationMode === 'user'
                                            ? 'bg-white shadow text-primary'
                                            : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    Real User
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {simulationMode === 'mock' ? (
                            <Textarea
                                className="font-mono h-[300px]"
                                value={mockData}
                                onChange={(e) => setMockData(e.target.value)}
                                placeholder='{"crop": "RICE", "stage": "SOWING"}'
                            />
                        ) : (
                            <div className="h-[300px] space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">User UUID</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded font-mono text-sm bg-background"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Enter a valid User ID from the database. The system will fetch their profile (District, Land Size, Role, Verification Status) and run the rules against it.
                                    </p>
                                </div>
                            </div>
                        )}
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
