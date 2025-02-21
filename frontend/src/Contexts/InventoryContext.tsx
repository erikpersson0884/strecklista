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
        { id: "1", name: 'Sommersby päron', price: 20, amountInStock: 10, available: true, imageUrl: 'https://cmxsapnc.cloudimg.io/fit/1200x1200/fbright5/_img_/18964/somersby-pear-45.jpg' },
        { id: "4", name: 'Royal', price: 7, amountInStock: 10, available: true, imageUrl: 'https://imagedelivery.net/8fY6if2LOxn7UCgUdZYwog/11800/contain' },
        { id: "3", name: 'Nudlar', price: 11, amountInStock: 140, available: true, imageUrl: 'https://d1ax460061ulao.cloudfront.net/1000x1000/8/f/8f9579852b5c9c8fab11b7aa15a8ad29.jpg' },
        { id: "5", name: 'Sommersby jordgubb lime', price: 22, amountInStock: 301, available: true, imageUrl: 'https://imagedelivery.net/8fY6if2LOxn7UCgUdZYwog/11800/contain' },
        { id: "6", name: 'Coca Cola', price: 15, amountInStock: 50, available: true, imageUrl: 'https://www.freeiconspng.com/uploads/red-coca-cola-box-png-transparent--0.png' },
        { id: "7", name: 'Pepsi', price: 14, amountInStock: 45, available: true, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_xBWwu-sE6AZ9FXZcVgL04g_Grq3YV7xhhw&s' },
        { id: "8", name: 'Fanta', price: 13, amountInStock: 60, available: true, imageUrl: 'https://www.coca-cola.com/content/dam/onexp/se/sv/products/new-2024-fanta-fenix-cans/orange_reg_.png' },
        { id: "9", name: 'Sprite', price: 12, amountInStock: 55, available: true, imageUrl: 'https://varsego.se/storage/2B84EC0632A4DD3EC832B388E5F789893AF849BE8798700FBFB8CE8927B766B0/de27fc73d37244e0ad2475548f8d35e4/png/media/87b3298be1da416088f5f759e315cc16/13152%20Sprite%2033cl.png' },
        { id: "11", name: 'Godis', price: 15, amountInStock: 35, available: true, imageUrl: 'https://candyking.com/wp-content/uploads/2023/03/Transparent.png' }
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

