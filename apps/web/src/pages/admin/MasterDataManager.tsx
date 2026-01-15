import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Database, List } from 'lucide-react';
import api from '@/services/api';
import { ADMIN_MASTER_DATA_ENDPOINTS } from '@/config/endpoints';
import { toast } from 'sonner';
import { resolveUserMessage } from '@/utils/errorUtils';

interface MasterCategory {
    id: string;
    code: string;
    name: string;
    description: string;
    active: boolean;
}

interface MasterItem {
    id: string;
    code: string;
    labelEn: string;
    labelNe: string;
    description: string;
    sortOrder: number;
    active: boolean;
}

const MasterDataManager = () => {
    const [categories, setCategories] = useState<MasterCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<MasterCategory | null>(null);
    const [items, setItems] = useState<MasterItem[]>([]);

    // Modal States
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isEditingItem, setIsEditingItem] = useState(false);

    // Form States
    const [newCategory, setNewCategory] = useState({ code: '', name: '', description: '' });
    const [currentItem, setCurrentItem] = useState<Partial<MasterItem>>({});

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchItems(selectedCategory.id);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const res = await api.get(ADMIN_MASTER_DATA_ENDPOINTS.CATEGORIES);
            if (res.data.code === 0) {
                setCategories(res.data.data);
                if (res.data.data.length > 0 && !selectedCategory) {
                    setSelectedCategory(res.data.data[0]);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch categories");
        }
    };

    const fetchItems = async (categoryId: string) => {
        try {
            const res = await api.get(ADMIN_MASTER_DATA_ENDPOINTS.ITEMS_BY_CATEGORY(categoryId));
            if (res.data.code === 0) {
                setItems(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch items");
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.code || !newCategory.name) {
            toast.error("Code and Name are required");
            return;
        }
        try {
            await api.post(ADMIN_MASTER_DATA_ENDPOINTS.CATEGORIES, newCategory);
            toast.success("Category created successfully");
            setIsCatModalOpen(false);
            setNewCategory({ code: '', name: '', description: '' });
            fetchCategories();
        } catch (err: any) {
            console.error(err);
            toast.error(resolveUserMessage(err));
        }
    };

    const handleSaveItem = async () => {
        if (!selectedCategory || !currentItem.code || !currentItem.labelEn) {
            toast.error("Code and Label (EN) are required");
            return;
        }

        try {
            if (isEditingItem && currentItem.id) {
                await api.put(ADMIN_MASTER_DATA_ENDPOINTS.ITEMS_BY_ID(currentItem.id), currentItem);
                toast.success("Item updated successfully");
            } else {
                await api.post(ADMIN_MASTER_DATA_ENDPOINTS.ITEMS_BY_CATEGORY(selectedCategory.id), currentItem);
                toast.success("Item created successfully");
            }
            setIsItemModalOpen(false);
            fetchItems(selectedCategory.id);
        } catch (err: any) {
            console.error(err);
            toast.error(resolveUserMessage(err));
        }
    };

    const openCreateItemModal = () => {
        setCurrentItem({ active: true, sortOrder: 0 });
        setIsEditingItem(false);
        setIsItemModalOpen(true);
    };

    const openEditItemModal = (item: MasterItem) => {
        setCurrentItem(item);
        setIsEditingItem(true);
        setIsItemModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Master Data Management</h2>
                    <p className="text-muted-foreground">Manage dropdowns and system constants</p>
                </div>
                <Button onClick={() => setIsCatModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Panel: Categories */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <Database className="mr-2 h-4 w-4" /> Categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`text-left px-4 py-3 text-sm transition-colors hover:bg-muted/50 border-l-2 ${selectedCategory?.id === cat.id
                                        ? 'border-primary bg-muted font-medium'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <div className="font-medium">{cat.name}</div>
                                    <div className="text-xs text-muted-foreground">{cat.code}</div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Right Panel: Items */}
                <Card className="md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center">
                            <List className="mr-2 h-4 w-4" />
                            {selectedCategory ? `${selectedCategory.name} Items` : 'Select a Category'}
                        </CardTitle>
                        {selectedCategory && (
                            <Button size="sm" onClick={openCreateItemModal}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {selectedCategory ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Order</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Label (EN)</TableHead>
                                        <TableHead>Label (NE)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.sortOrder}</TableCell>
                                            <TableCell className="font-medium font-mono text-xs">{item.code}</TableCell>
                                            <TableCell>{item.labelEn}</TableCell>
                                            <TableCell className="font-nepali">{item.labelNe || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.active ? "outline" : "secondary"} className={item.active ? "text-green-600 border-green-600 bg-green-50" : ""}>
                                                    {item.active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditItemModal(item)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                                No items found in this category.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center h-48 flex items-center justify-center text-muted-foreground">
                                Select a category to view its items.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Category Modal */}
            <Dialog open={isCatModalOpen} onOpenChange={setIsCatModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Code (Unique)</Label>
                            <Input
                                placeholder="e.g. CROP_TYPE"
                                value={newCategory.code}
                                onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                placeholder="e.g. Crop Types"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Optional description..."
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleCreateCategory}>Create Category</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Item Modal */}
            <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <Input
                                    placeholder="e.g. RICE"
                                    value={currentItem.code || ''}
                                    onChange={(e) => setCurrentItem({ ...currentItem, code: e.target.value })}
                                    disabled={isEditingItem} // Cannot change code logic
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input
                                    type="number"
                                    value={currentItem.sortOrder || 0}
                                    onChange={(e) => setCurrentItem({ ...currentItem, sortOrder: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Label (English)</Label>
                            <Input
                                placeholder="e.g. Rice"
                                value={currentItem.labelEn || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, labelEn: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Label (Nepali)</Label>
                            <Input
                                placeholder="e.g. धान"
                                value={currentItem.labelNe || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, labelNe: e.target.value })}
                                className="font-nepali"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                placeholder="Optional..."
                                value={currentItem.description || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="active"
                                checked={currentItem.active ?? true}
                                onChange={(e) => setCurrentItem({ ...currentItem, active: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleSaveItem}>Save Item</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MasterDataManager;
