import { createContext, useState, useContext, ReactNode } from 'react';
import { getInventory as getInventoryApiCall, updateProduct as updateProductApiCall } from '../api/inventoryApi';
import { Product } from '../Types';
import { useEffect } from 'react';

interface InventoryContextProps {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (updatedProduct: Product) => void;
    removeProduct: (id: string) => void;
    changeProductAmount: (id: string, amount: number) => void;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);

    const fetchInventory = async () => {
        try {
            const inventory: Product[] = await getInventoryApiCall();
            setProducts(inventory);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const addProduct = (product: Product) => {
        setProducts([...products, product]);
    };

    const updateProduct = (product: Product) => {
        updateProductApiCall(product);
        fetchInventory();
    };

    const changeProductAmount = (id: string, amount: number) => {
        setProducts(products.map(product => 
            product.id === id ? { ...product, amountInStock: product.amountInStock + amount } : product
        ));
    };

    const removeProduct = (id: string) => {
        setProducts(products.filter(product => product.id !== id));
    };

    return (
        <InventoryContext.Provider value={{ products, addProduct, updateProduct, removeProduct, changeProductAmount }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventory must be used within an InventoryProvider');
    }
    return context;
};

