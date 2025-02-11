import { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../Types';

interface InventoryContextProps {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (id: number, updatedProduct: Partial<Product>) => void;
    removeProduct: (id: number) => void;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([
        { id: 1, name: 'Coca Cola', price: 20, amountInStock: 10, imageUrl: 'https://cmxsapnc.cloudimg.io/fit/1200x1200/fbright5/_img_/18964/somersby-pear-45.jpg' },
        { id: 2, name: 'Fanta', price: 20, amountInStock: 10, imageUrl: 'https://imagedelivery.net/8fY6if2LOxn7UCgUdZYwog/11800/contain' },
        { id: 1, name: 'Coca Cola', price: 16, amountInStock: 140, imageUrl: 'https://cmxsapnc.cloudimg.io/fit/1200x1200/fbright5/_img_/18964/somersby-pear-45.jpg' },
        { id: 2, name: 'Fanta', price: 12, amountInStock: 301, imageUrl: 'https://imagedelivery.net/8fY6if2LOxn7UCgUdZYwog/11800/contain' },
    ]);

    const addProduct = (product: Product) => {
        setProducts([...products, product]);
    };

    const updateProduct = (id: number, updatedProduct: Partial<Product>) => {
        setProducts(products.map(product => 
            product.id === id ? { ...product, ...updatedProduct } : product
        ));
    };

    const removeProduct = (id: number) => {
        setProducts(products.filter(product => product.id !== id));
    };

    return (
        <InventoryContext.Provider value={{ products, addProduct, updateProduct, removeProduct }}>
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

