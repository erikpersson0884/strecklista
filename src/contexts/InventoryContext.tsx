import { createContext, useState, useContext, ReactNode } from 'react';
import inventoryApi from '../inventoryApi';
import { useEffect } from 'react';
import { productAdapter } from '../adapters/productAdapter';


interface InventoryContextProps {
    isLoading: boolean;
    products: IItem[];
    addProduct: (displayName: string, internalPrice: number, icon?: string) => Promise<boolean>;
    updateProduct: (updatedProduct: IItem) => Promise<boolean>;
    deleteProduct: (id: Id) => Promise<boolean>;
    toggleFavourite: (id: Id) => Promise<boolean>;
    refillProduct: (id: Id, amount: number) => Promise<boolean>;
    getProductById: (id: Id) => IItem;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<IItem[]>([]);

    const fetchInventory = async () => {
        try {
            const apiItems: ApiItem[] = await inventoryApi.getInventory();
            const newProducts = apiItems.map(productAdapter);
            setProducts(newProducts);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        }
    };

    useEffect( () => {
        fetchInventory();
    }, []);

    const getProductById = (id: Id): IItem => {
        const item = products.find(item => item.id === id);
        if (!item) throw new Error(`Item with id ${id} not found`);
        return item;
    };

    const addProduct = async (
        displayName: string, 
        internalPrice: number, 
        icon?: string
    ): Promise<boolean> => {
        
        const prices = [{
            displayName: "Internt",
            price: internalPrice
        }];
        try {
            const success: boolean = await inventoryApi.addProduct(displayName, prices, icon);
            fetchInventory();
            return success;
        } catch (error) {
            console.error('Failed to add item', error);
            return false;
        }
    };

    const updateProduct = async (updatedProduct: IItem): Promise<boolean> => {
        const item = products.find(item => item.id === updatedProduct.id);
        if (!item) throw new Error('Item not found');

        const updatedFields: Partial<ApiItem> = {};

        if (item.name !== updatedProduct.name) updatedFields.displayName = updatedProduct.name;
        if (item.available !== updatedProduct.available) updatedFields.visible = updatedProduct.available;
        if (item.favorite !== updatedProduct.favorite) updatedFields.favorite = updatedProduct.favorite;
        if (item.icon !== updatedProduct.icon) updatedFields.icon = updatedProduct.icon;

        if (item.internalPrice !== updatedProduct.internalPrice) {
            updatedFields.prices = [
                {
                    price: updatedProduct.internalPrice,
                    displayName: 'Internt'
                }
            ]
        }
        if (Object.keys(updatedFields).length > 0) {
            const success = await inventoryApi.updateProduct(updatedProduct.id, updatedFields);
            fetchInventory();
            return success;
        }
        return false;
    };

    const refillProduct = async (id: Id, amount: number): Promise<boolean> => {
        const item = products.find(item => item.id === id);
        if (!item) throw new Error('Item not found');

        const success = await inventoryApi.refillProduct(id, amount);
        if (success) {
            fetchInventory();
        }
        return success;
    }

    const toggleFavourite = async (id: Id): Promise<boolean> => {
        const item = products.find(item => item.id === id);
        if (!item) throw new Error('Item not found');

        const updatedProduct: IItem = { ...item, favorite: !item.favorite };

        const success = await updateProduct(updatedProduct);
        if (success) {
            fetchInventory();
        }
        return success;
    }

    const deleteProduct = async (id: Id): Promise<boolean>  => {
        if (!products.some(item => item.id === id)) throw new Error('Item not found');
        const success = await inventoryApi.deleteProduct(id);
        fetchInventory();
        return success;
    }

    return (
        <InventoryContext.Provider value={{ 
            isLoading, 
            products, 
            addProduct, 
            updateProduct, 
            deleteProduct, 
            toggleFavourite,
            refillProduct,
            getProductById
        }}>
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

