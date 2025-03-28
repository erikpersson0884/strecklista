import { createContext, useState, useContext, ReactNode } from 'react';
import { getInventory as getInventoryApiCall, 
        addProduct as addProductApiCall,
        updateProduct as updateProductApiCall, 
        deleteProduct as deleteProductApiCall } from '../api/inventoryApi';
import { useEffect } from 'react';


interface InventoryContextProps {
    products: Product[];
    addProduct: (displayName: string, internalPrice: number, icon?: string) => Promise<boolean>;
    updateProduct: (updatedProduct: Product) => void;
    deleteProduct: (id: number) => Promise<boolean>;
    changeProductAmount: (id: number, amount: number) => void;
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


    const addProduct = async (displayName: string, internalPrice: number, icon?: string): Promise<boolean> => {
        const prices = [{
            displayName: "Internt",
            price: internalPrice
        }];
        
        const success = await addProductApiCall(displayName, prices, icon);
        fetchInventory();
        return success;
    };

    const updateProduct = async (updatedProduct: Product): Promise<boolean> => {
        const product = products.find(product => product.id === updatedProduct.id);
        if (!product) throw new Error('Product not found');

        const updatedFields: Partial<IApiItem> = {};

        if (product.name !== updatedProduct.name) updatedFields.displayName = updatedProduct.name;
        if (product.available !== updatedProduct.available) updatedFields.visible = updatedProduct.available;
        if (product.favorite !== updatedProduct.favorite) updatedFields.favorite = updatedProduct.favorite;
        if (product.icon !== updatedProduct.icon) updatedFields.icon = updatedProduct.icon;

        if (product.internalPrice !== updatedProduct.internalPrice) {
            updatedFields.prices = [
                {
                    price: updatedProduct.internalPrice,
                    displayName: 'Internt'
                }
            ]
        }

        if (Object.keys(updatedFields).length > 0) {
            const success = await updateProductApiCall(updatedProduct.id, updatedFields);
            fetchInventory();
            return success;
        }
        return false;
    };

    const deleteProduct = async (id: number): Promise<boolean>  => {
        if (!products.some(product => product.id === id)) throw new Error('Product not found');
        const success = await deleteProductApiCall(id);
        fetchInventory();
        return success;
    }
        

    const changeProductAmount = async (id: number, amount: number): Promise<boolean> => {
        const newProduct = products.find(product => product.id === id);
        if (!newProduct) throw new Error('Product not found');
        newProduct.amountInStock += amount;
        
        const success = await updateProduct(newProduct);
        return success;
    };

    return (
        <InventoryContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, changeProductAmount }}>
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

