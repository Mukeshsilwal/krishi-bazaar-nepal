import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { agriStoreService, AgriProduct } from '@/services/agriStoreService';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const AgriProductManager = () => {
    const [products, setProducts] = useState<AgriProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('ALL');

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<AgriProduct | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    // Form State
    const [formData, setFormData] = useState<Partial<AgriProduct>>({
        name: '',
        category: 'SEEDS',
        description: '',
        brand: '',
        price: 0,
        unit: 'PACK',
        stockQuantity: 0,
        imageUrl: '',
        isActive: true
    });

    useEffect(() => {
        fetchProducts();
    }, [search, category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (category !== 'ALL') params.category = category;
            const data = await agriStoreService.getAllProducts(params);
            setProducts(data.content);
        } catch (error) {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (product?: AgriProduct) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                description: product.description,
                brand: product.brand,
                price: product.price,
                unit: product.unit,
                stockQuantity: product.stockQuantity,
                imageUrl: product.imageUrl,
                isActive: product.isActive
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: 'SEEDS',
                description: '',
                brand: '',
                price: 0,
                unit: 'PACK',
                stockQuantity: 0,
                imageUrl: '',
                isActive: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingProduct) {
                await agriStoreService.updateProduct(editingProduct.id, formData);
                toast.success("Product updated successfully");
            } else {
                await agriStoreService.createProduct(formData);
                toast.success("Product created successfully");
            }
            setIsDialogOpen(false);
            fetchProducts();
        } catch (error) {
            toast.error("Failed to save product");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteDialog.id) return;

        try {
            await agriStoreService.deleteProduct(deleteDialog.id);
            toast.success("Product deleted successfully");
            fetchProducts();
        } catch (error) {
            toast.error("Failed to delete product");
        } finally {
            setDeleteDialog({ open: false, id: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agri Store Management</h2>
                    <p className="text-muted-foreground">Manage products, stock, and pricing.</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Search products..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        <SelectItem value="SEEDS">Seeds</SelectItem>
                        <SelectItem value="FERTILIZERS">Fertilizers</SelectItem>
                        <SelectItem value="PESTICIDES">Pesticides</SelectItem>
                        <SelectItem value="TOOLS">Tools</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                </TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>NPR {product.price} / {product.unit}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={product.stockQuantity < 10 ? "text-red-500 font-bold" : ""}>
                                                {product.stockQuantity}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={product.isActive ? "default" : "secondary"}>
                                            {product.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Brand</Label>
                                <Input
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val: any) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SEEDS">Seeds</SelectItem>
                                        <SelectItem value="FERTILIZERS">Fertilizers</SelectItem>
                                        <SelectItem value="PESTICIDES">Pesticides</SelectItem>
                                        <SelectItem value="TOOLS">Tools</SelectItem>
                                        <SelectItem value="MACHINERY">Machinery</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Unit</Label>
                                <Select
                                    value={formData.unit}
                                    onValueChange={(val: any) => setFormData({ ...formData, unit: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PACK">Pack</SelectItem>
                                        <SelectItem value="KG">Kg</SelectItem>
                                        <SelectItem value="GRAM">Gram</SelectItem>
                                        <SelectItem value="LITER">Liter</SelectItem>
                                        <SelectItem value="PIECE">Piece</SelectItem>
                                        <SelectItem value="BAG">Bag</SelectItem>
                                        <SelectItem value="BOTTLE">Bottle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Price (NPR)</Label>
                                <Input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Stock Quantity</Label>
                                <Input
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Image URL</Label>
                            <Input
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="h-24"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label>Active Status</Label>
                            <Select
                                value={formData.isActive ? "true" : "false"}
                                onValueChange={(val) => setFormData({ ...formData, isActive: val === 'true' })}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Product
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
                onConfirm={confirmDelete}
                title="Delete Product"
                description="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                icon={<Trash2 className="h-6 w-6 text-red-600" />}
            />
        </div >
    );
};

export default AgriProductManager;
