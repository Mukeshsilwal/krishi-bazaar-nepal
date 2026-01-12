import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { ADMIN_ENDPOINTS } from '@/config/endpoints';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from '@/components/ui/skeletons';
import PageHeader from '@/components/admin/PageHeader';
import { Save, RefreshCw } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SystemConfig {
    key: string;
    value: string;
    description: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
    category: string;
    editable: boolean;
}

const SettingsManager = () => {
    const [configs, setConfigs] = useState<SystemConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await api.get(ADMIN_ENDPOINTS.SETTINGS);
            if (res.data.success) {
                setConfigs(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load system configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string) => {
        setSaving(prev => ({ ...prev, [key]: true }));
        try {
            const res = await api.put(ADMIN_ENDPOINTS.SETTING_BY_KEY(key), { value });
            if (res.data.success) {
                toast.success("Configuration updated successfully");
                // Update local state
                setConfigs(prev => prev.map(c => c.key === key ? { ...c, value } : c));
                // Clear editing state
                setEditing(prev => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update configuration");
        } finally {
            setSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setEditing(prev => ({ ...prev, [key]: value }));
    };

    const getUniqueCategories = () => {
        const categories = new Set(configs.map(c => c.category || 'OTHER'));
        return Array.from(categories).sort();
    };

    const filteredConfigs = (category: string) => {
        return configs.filter(c => (c.category || 'OTHER') === category);
    };

    if (loading) return <div className="p-6"><TableSkeleton /></div>;

    const categories = getUniqueCategories();

    return (
        <div className="space-y-6">
            <PageHeader
                title="System Configuration"
                description="Manage global application settings, thresholds, and feature flags."
                breadcrumbs={[{ label: 'Settings' }]}
                actions={
                    <Button variant="outline" size="sm" onClick={fetchConfigs}>
                        <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                }
            />

            <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="mb-4 flex-wrap h-auto">
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>

                {categories.map(category => (
                    <TabsContent key={category} value={category} className="space-y-4">
                        {filteredConfigs(category).map((config) => (
                            <Card key={config.key}>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base font-medium">{config.key}</CardTitle>
                                                {!config.editable && <Badge variant="secondary">Read Only</Badge>}
                                            </div>
                                            <CardDescription>{config.description}</CardDescription>
                                        </div>
                                        {config.type === 'BOOLEAN' && config.editable && (
                                            <Switch
                                                checked={config.value === 'true'}
                                                onCheckedChange={(checked) => handleUpdate(config.key, String(checked))}
                                                disabled={saving[config.key]}
                                            />
                                        )}
                                    </div>
                                </CardHeader>
                                {(config.type !== 'BOOLEAN' || !config.editable) && (
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <Label className="sr-only">Value</Label>
                                                <Input
                                                    value={editing[config.key] ?? config.value}
                                                    onChange={(e) => handleInputChange(config.key, e.target.value)}
                                                    disabled={!config.editable || saving[config.key]}
                                                    type={config.type === 'NUMBER' ? 'number' : 'text'}
                                                />
                                            </div>
                                            {config.editable && editing[config.key] !== undefined && editing[config.key] !== config.value && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdate(config.key, editing[config.key])}
                                                    disabled={saving[config.key]}
                                                >
                                                    {saving[config.key] ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                                    Save
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        ))}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default SettingsManager;
