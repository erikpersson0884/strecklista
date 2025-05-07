import { createContext, useState, useContext, ReactNode } from 'react';
import { getInventory as getInventoryApiCall, 
        addProduct as addProductApiCall,
        updateProduct as updateProductApiCall, 
        deleteProduct as deleteProductApiCall } from '../api/inventoryApi';
import { useEffect } from 'react';


interface InventoryContextProps {
    products: ProductT[];
    addProduct: (displayName: string, internalPrice: number, icon?: string) => Promise<boolean>;
    updateProduct: (updatedProduct: ProductT) => void;
    deleteProduct: (id: number) => Promise<boolean>;
    changeProductAmount: (id: number, amount: number) => void;
    toggleFavourite: (id: number) => Promise<boolean>;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<ProductT[]>([]);


    const transformApiItemToProduct = (apiItem: IApiItem): ProductT => {
        const internalPrice: Price | undefined = apiItem.prices.find((price: Price) => price.displayName === "Internt");
        if (!internalPrice) {
            alert(`Internal price for an item was not found:\ndisplayName: ${apiItem.displayName}\nid: ${apiItem.id}`);
            throw new Error(`Internal price for item ${apiItem.displayName}, ${apiItem.id} not found`);
        }
        
        return {
            id: apiItem.id,
            name: apiItem.displayName,
            icon: apiItem.icon || "",
            available: apiItem.visible,
            favorite: apiItem.favorite,
            internalPrice: internalPrice.price,
            addedTime: apiItem.addedTime,
            timesPurchased: apiItem.timesPurchased,
    
            amountInStock: 0, //TODO: set to actual value when api implementes stock tracking
        };
    };

    const fetchInventory = async () => {
        try {
            const inventory: IApiItem[] = await getInventoryApiCall();
            const transformedInventory = inventory.map(transformApiItemToProduct);
            setProducts(transformedInventory);
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

    const updateProduct = async (updatedProduct: ProductT): Promise<boolean> => {
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

    const toggleFavourite = async (id: number): Promise<boolean> => {
        const product = products.find(product => product.id === id);
        if (!product) throw new Error('Product not found');
        product.favorite = !product.favorite;
        const success = await updateProduct(product);
        if (success) {
            fetchInventory();
        }
        return success;
    }

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
        <InventoryContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, changeProductAmount, toggleFavourite }}>
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

