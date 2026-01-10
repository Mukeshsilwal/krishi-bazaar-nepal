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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from '@/components/ui/skeletons';
import PageHeader from '@/components/admin/PageHeader';
import { Save } from 'lucide-react';

interface SystemSetting {
    key: string;
    value: string;
    description: string;
    type: 'STRING' | 'BOOLEAN' | 'NUMBER';
}

const SettingsManager = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get(ADMIN_ENDPOINTS.SETTINGS);
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string) => {
        try {
            // Create updated list for API call
            const updatedSettings = settings.map(s => s.key === key ? { ...s, value } : s);

            await api.post(ADMIN_ENDPOINTS.SETTINGS, updatedSettings);
            toast.success("Settings saved");

            // Update local state
            setSettings(updatedSettings);

            // Clear draft if any
            const newEditing = { ...editing };
            delete newEditing[key];
            setEditing(newEditing);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update setting");
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setEditing(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return <div className="p-6"><TableSkeleton /></div>;

    return (
        <div className="space-y-6">
            <PageHeader
                title="System Configuration"
                description="Manage global application settings and feature flags."
                breadcrumbs={[{ label: 'Settings' }]}
            />

            <div className="grid gap-6">
                {settings.map((setting) => (
                    <Card key={setting.key}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-medium">{setting.key.replace(/_/g, ' ').toUpperCase()}</CardTitle>
                                    <CardDescription>{setting.description}</CardDescription>
                                </div>
                                {setting.type === 'BOOLEAN' && (
                                    <Switch
                                        checked={setting.value === 'true'}
                                        onCheckedChange={(checked) => handleUpdate(setting.key, String(checked))}
                                    />
                                )}
                            </div>
                        </CardHeader>
                        {setting.type !== 'BOOLEAN' && (
                            <CardContent>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <Label className="sr-only">Value</Label>
                                        <Input
                                            value={editing[setting.key] ?? setting.value}
                                            onChange={(e) => handleInputChange(setting.key, e.target.value)}
                                        />
                                    </div>
                                    {editing[setting.key] !== undefined && editing[setting.key] !== setting.value && (
                                        <Button size="sm" onClick={() => handleUpdate(setting.key, editing[setting.key])}>
                                            <Save className="h-4 w-4 mr-2" /> Save
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SettingsManager;
