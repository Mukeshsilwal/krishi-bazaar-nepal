import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Activity, HardDrive, Cpu, Server, Info } from 'lucide-react';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/config/endpoints';
import { BACKEND_URL } from '@/config/app';
import { toast } from 'sonner';

interface SystemHealth {
    status: string;
    components: {
        db: { status: string; details?: any };
        diskSpace: { status: string; details?: any };
        ping: { status: string };
    };
}

interface IntegrationStatus {
    [key: string]: {
        status: 'UP' | 'DOWN' | 'UNKNOWN';
        details: string;
    };
}

const SystemHealth = () => {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [info, setInfo] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSystemData();
        const interval = setInterval(fetchSystemData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchSystemData = async () => {
        try {
            const [healthRes, infoRes, integrationsRes] = await Promise.all([
                api.get(ADMIN_ENDPOINTS.ACTUATOR_HEALTH, { baseURL: BACKEND_URL }),
                api.get(ADMIN_ENDPOINTS.ACTUATOR_INFO, { baseURL: BACKEND_URL }).catch(() => ({ data: { app: { name: 'Kisan Sarathi API', version: '1.0.0' } } })), // Fallback if info not configured fully
                api.get(ADMIN_ENDPOINTS.HEALTH_INTEGRATIONS).catch(() => ({ data: { success: false, data: null } }))
            ]);

            setHealth(healthRes.data);
            setInfo(infoRes.data);
            if (integrationsRes.data.success) {
                setIntegrations(integrationsRes.data.data);
            }

            // Fetch specific metrics
            const metricNames = ['system.cpu.usage', 'process.uptime', 'jvm.memory.used', 'jvm.memory.max'];
            const metricsData: any = {};

            for (const name of metricNames) {
                try {
                    const res = await api.get(ADMIN_ENDPOINTS.ACTUATOR_METRICS(name), { baseURL: BACKEND_URL });
                    metricsData[name] = res.data.measurements[0].value;
                } catch (e) {
                    console.warn(`Failed to fetch metric ${name}`);
                }
            }
            setMetrics(metricsData);

            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch system status");
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    if (loading) {
        return <div className="p-8 text-center">Loading system health...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Health & Ops</h2>
                    <p className="text-muted-foreground">Real-time system monitoring and status.</p>
                </div>
                <Badge variant={health?.status === 'UP' ? 'secondary' : 'destructive'} className={health?.status === 'UP' ? 'bg-green-600' : ''}>
                    {health?.status || 'UNKNOWN'}
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{health?.status}</div>
                        <p className="text-xs text-muted-foreground">Global API Status</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics ? formatUptime(metrics['process.uptime']) : '-'}</div>
                        <p className="text-xs text-muted-foreground">Since last restart</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics ? (metrics['system.cpu.usage'] * 100).toFixed(1) + '%' : '-'}</div>
                        <p className="text-xs text-muted-foreground">System Load</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Memory</CardTitle>
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics ? formatBytes(metrics['jvm.memory.used']) : '-'}</div>
                        <p className="text-xs text-muted-foreground">of {metrics ? formatBytes(metrics['jvm.memory.max']) : '-'} Allocated</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">External Integrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {integrations ? Object.entries(integrations).map(([name, data]) => (
                                <div key={name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${data.status === 'UP' ? 'bg-green-500' :
                                            data.status === 'DOWN' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`} />
                                        <div className="text-sm font-medium">{name}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{data.details}</div>
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground">Loading integrations...</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Health Details</TabsTrigger>
                    <TabsTrigger value="info">Build Info</TabsTrigger>
                </TabsList>
                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Components</CardTitle>
                            <CardDescription>
                                Individual status of system components.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {health?.components && Object.entries(health.components).map(([key, val]: [string, any]) => (
                                <div key={key} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${val.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className="font-medium capitalize">{key}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{val.status}</span>
                                </div>
                            ))}
                            {!health?.components && (
                                <div className="text-sm text-muted-foreground">No detailed component info available. Enable <code>management.endpoint.health.show-details=always</code>.</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                                {JSON.stringify(info, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SystemHealth;
