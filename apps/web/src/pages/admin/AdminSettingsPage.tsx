import React, { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description: string;
    type: 'STRING' | 'BOOLEAN' | 'NUMBER' | 'JSON';
    public: boolean;
}

const AdminSettingsPage = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { refreshSettings } = useSettings();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index: number, value: string) => {
        const newSettings = [...settings];
        newSettings[index].value = value;
        setSettings(newSettings);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.post('/admin/settings', settings);
            if (response.data.success) {
                toast.success("Settings updated successfully");
                setSettings(response.data.data);
                await refreshSettings(); // Refresh public settings
            }
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    // Group settings by prefix (first word)
    const groupedSettings = settings.reduce((acc, setting) => {
        const prefix = setting.key.split('_')[0];
        if (!acc[prefix]) acc[prefix] = [];
        acc[prefix].push(setting);
        return acc;
    }, {} as Record<string, SystemSetting[]>);

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-500">Configure global application settings</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchSettings} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {Object.entries(groupedSettings).map(([group, groupSettings]) => (
                    <Card key={group}>
                        <CardHeader>
                            <CardTitle className="capitalize">{group.toLowerCase()} Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {groupSettings.map((setting, index) => {
                                // Find global index
                                const realIndex = settings.findIndex(s => s.key === setting.key);

                                return (
                                    <div key={setting.key} className="space-y-2">
                                        <Label htmlFor={setting.key} className="font-medium">
                                            {setting.description || setting.key}
                                        </Label>

                                        {setting.value.length > 100 || setting.key.includes('DESCRIPTION') || setting.key.includes('DESC') ? (
                                            <Textarea
                                                id={setting.key}
                                                value={setting.value}
                                                onChange={(e) => handleChange(realIndex, e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        ) : (
                                            <Input
                                                id={setting.key}
                                                value={setting.value}
                                                onChange={(e) => handleChange(realIndex, e.target.value)}
                                            />
                                        )}
                                        <p className="text-xs text-gray-500 font-mono">{setting.key}</p>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminSettingsPage;
