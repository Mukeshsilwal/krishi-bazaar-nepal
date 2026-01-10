import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgriProduct } from '@/services/agriStoreService';
import { toast } from 'sonner';

export interface CartItem {
    product: AgriProduct;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: AgriProduct, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('agri_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('agri_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (product: AgriProduct, quantity: number = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // Check stock limit
                if (existing.quantity + quantity > product.stockQuantity) {
                    toast.error(`Cannot add more. Max stock is ${product.stockQuantity}`);
                    return prev;
                }
                toast.success("Cart updated");
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            if (quantity > product.stockQuantity) {
                toast.error(`Cannot add more. Max stock is ${product.stockQuantity}`);
                return prev;
            }
            toast.success("Added to cart");
            return [...prev, { product, quantity }];
        });
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
        toast.info("Item removed from cart");
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                if (quantity > item.product.stockQuantity) {
                    toast.error(`Max stock available is ${item.product.stockQuantity}`);
                    return item;
                }
                if (quantity < 1) return item;
                return { ...item, quantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem('agri_cart');
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
