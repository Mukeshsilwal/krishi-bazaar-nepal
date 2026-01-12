import React, { useState, useEffect } from 'react';
import { useAdminTitle } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Save,
    X,
    Zap,
    CheckCircle,
    XCircle
} from 'lucide-react';
import advisoryService from '@/modules/advisory/services/advisoryService';
import { toast } from 'sonner';

interface Rule {
    id?: string;
    name: string;
    definition: any; // JSON Object
    status: 'ACTIVE' | 'DRAFT' | 'RETIRED';
    isActive: boolean;
    priority: number;
}

const RuleCMSPage = () => {
    const { language } = useLanguage();
    const { setTitle } = useAdminTitle();

    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTitle('Rule Management', 'नियम व्यवस्थापन');
        fetchRules();
    }, [setTitle]);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await advisoryService.getAllRules();
            // Ensure data is array (handle api response structure)
            const list = Array.isArray(data) ? data : (data.data || []);
            setRules(list);
        } catch (e) {
            console.error(e);
            // toast.error('Failed to load rules');
        } finally {
            setLoading(false);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [editingRule, setEditingRule] = useState<Partial<Rule>>({
        name: '',
        priority: 10,
        isActive: true,
        status: 'ACTIVE',
        definition: {
            conditions: [
                { field: 'crop', operator: 'EQUALS', value: 'RICE' }
            ],
            actions: [
                { type: 'GENERATE_ADVISORY', payload: { disease: 'Rice Blast', severity: 'HIGH' } }
            ],
            logic: 'AND'
        }
    });
    const [definitionString, setDefinitionString] = useState('');

    useEffect(() => {
        if (isEditing && editingRule.definition) {
            setDefinitionString(JSON.stringify(editingRule.definition, null, 2));
        }
    }, [isEditing, editingRule.id]); // Only when opening

    const handleJsonChange = (val: string) => {
        setDefinitionString(val);
        try {
            const parsed = JSON.parse(val);
            setEditingRule(prev => ({ ...prev, definition: parsed }));
            setJsonError(null);
        } catch (e) {
            setJsonError('Invalid JSON format');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (jsonError) {
            toast.error('Fix JSON errors first');
            return;
        }
        try {
            if (editingRule.id) {
                await advisoryService.updateRule(editingRule.id, editingRule);
                toast.success('Rule updated');
            } else {
                await advisoryService.createRule(editingRule);
                toast.success('Rule created');
            }
            setIsEditing(false);
            fetchRules();
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    if (isEditing) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-600" />
                        {editingRule.id ? 'Edit Rule' : 'New Rule'}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rule Name</label>
                                <Input
                                    value={editingRule.name}
                                    onChange={e => setEditingRule({ ...editingRule, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Priority (Higher runs first)</label>
                                <Input
                                    type="number"
                                    value={editingRule.priority}
                                    onChange={e => setEditingRule({ ...editingRule, priority: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={editingRule.isActive}
                                    onCheckedChange={c => setEditingRule({ ...editingRule, isActive: c })}
                                />
                                <label className="text-sm font-medium">Active</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Rule Definition (JSON)</label>
                            <CardDescription className="mb-2">
                                Define conditions and actions. Format:
                                <code>{` { "conditions": [...], "actions": [...], "logic": "AND" }`}</code>
                            </CardDescription>
                            <Textarea
                                className="font-mono min-h-[300px]"
                                value={definitionString}
                                onChange={e => handleJsonChange(e.target.value)}
                            />
                            {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button type="submit" className="gap-2 bg-yellow-600 hover:bg-yellow-700">
                                <Save className="h-4 w-4" />
                                Save Rule
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Rule Management
                </CardTitle>
                <Button onClick={() => {
                    setEditingRule({
                        name: '', priority: 10, isActive: true, status: 'ACTIVE',
                        definition: {
                            conditions: [{ field: 'crop', operator: 'EQUALS', value: 'RICE' }],
                            actions: [{ type: 'GENERATE_ADVISORY', payload: { disease: 'Rice Blast', severity: 'HIGH' } }],
                            logic: 'AND'
                        }
                    });
                    setIsEditing(true);
                }} className="gap-2 bg-yellow-600 hover:bg-yellow-700">
                    <Plus className="h-4 w-4" /> New Rule
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? <p className="text-center py-8 text-muted-foreground">Loading rules...</p> : (
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No rules found</TableCell>
                                    </TableRow>
                                ) : rules.map(rule => (
                                    <TableRow key={rule.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">{rule.name}</TableCell>
                                        <TableCell>
                                            {rule.isActive ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 gap-1"><CheckCircle className="h-3 w-3" /> Active</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" /> Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{rule.priority}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                setEditingRule(rule);
                                                // Trigger useEffect to stringify definition
                                                setIsEditing(true);
                                            }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RuleCMSPage;
