import React, { useState, useEffect } from 'react';
import api from '@/services/api';
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
import { Textarea } from "@/components/ui/textarea";

interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description: string;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
    public?: boolean;
    isPublic?: boolean;
}

const SettingsManager = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            // Request large size to get all settings for grouping, complying with backend pagination
            const res = await api.get('/admin/settings?page=0&size=200&sort=key,asc');
            if (res.data.code === 0) {
                // Backend now returns PaginatedResponse, so we need res.data.data.content
                const content = res.data.data?.content || [];
                // Map backend fields to frontend interface if needed
                const mappedSettings = content.map((s: any) => ({
                    ...s,
                    public: s.isPublic !== undefined ? s.isPublic : s.public // Handle field mismatch
                }));
                setSettings(mappedSettings);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const res = await api.post('/admin/settings', settings);
            if (res.data.code === 0) {
                toast.success("Settings updated successfully");
                setSettings(res.data.data);
                setEditing({});
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        const newSettings = [...settings];
        newSettings[index].value = value;
        setSettings(newSettings);
        setEditing(prev => ({ ...prev, [newSettings[index].key]: value }));
    };

    // Group settings by prefix (first word)
    const groupedSettings = settings.reduce((acc, setting) => {
        const prefix = setting.key.split('_')[0];
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(setting);
        return acc;
    }, {} as Record<string, SystemSetting[]>);

    const categories = Object.keys(groupedSettings).sort();

    if (loading) return <div className="p-6"><TableSkeleton /></div>;

    return (
        <div className="space-y-6">
            <PageHeader
                title="System Configuration"
                description="Manage global application settings, thresholds, and content."
                breadcrumbs={[{ label: 'Settings' }]}
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchSettings}>
                            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                        </Button>
                        <Button size="sm" onClick={handleUpdate} disabled={saving}>
                            <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
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
                        {groupedSettings[category].map((setting) => {
                            const realIndex = settings.findIndex(s => s.key === setting.key);
                            return (
                                <Card key={setting.key}>
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-base font-medium">{setting.key}</CardTitle>
                                                    {setting.public && <Badge variant="outline">Public</Badge>}
                                                </div>
                                                <CardDescription>{setting.description}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {setting.value.length > 100 || setting.key.includes('DESCRIPTION') || setting.key.includes('DESC') ? (
                                                <Textarea
                                                    value={setting.value}
                                                    onChange={(e) => handleChange(realIndex, e.target.value)}
                                                    className="min-h-[100px]"
                                                />
                                            ) : (
                                                <Input
                                                    value={setting.value}
                                                    onChange={(e) => handleChange(realIndex, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default SettingsManager;
