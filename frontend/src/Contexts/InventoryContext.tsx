import { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../Types';

interface InventoryContextProps {
    products: Product[];
    addProduct: (product: Product) => void;
    updateProduct: (id: string, updatedProduct: Partial<Product>) => void;
    removeProduct: (id: string) => void;
    changeProductAmount: (id: string, amount: number) => void;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([
        { id: "1", name: 'Coca Cola', price: 20, amountInStock: 10, available: true, imageUrl: 'https://cmxsapnc.cloudimg.io/fit/1200x1200/fbright5/_img_/18964/somersby-pear-45.jpg' },
        { id: "4", name: 'Fanta', price: 20, amountInStock: 10, available: true, imageUrl: 'https://imagedelivery.net/8fY6if2LOxn7UCgUdZYwog/11800/contain' },
        { id: "3", name: 'Coca Cola', price: 16, amountInStock: 140, available: true, imageUrl: 'https://cmxsapnc.cloudimg.io/fit/1200x1200/fbright5/_img_/18964/somersby-pear-45.jpg' },
        { id: "5", name: 'Fanta', price: 12, amountInStock: 301, available: true, imageUrl: 'https://imagedelivery.net/8fY6if2LOxn7UCgUdZYwog/11800/contain' },
    ]);

    const addProduct = (product: Product) => {
        setProducts([...products, product]);
    };

    const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
        setProducts(products.map(product => 
            product.id === id ? { ...product, ...updatedProduct } : product
        ));

        console.log(products);
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

