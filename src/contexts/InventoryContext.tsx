import { createContext, useState, useContext, ReactNode } from 'react';
import inventoryApi from '../api/inventoryApi';
import { useEffect } from 'react';
import { productAdapter } from '../adapters/productAdapter';


interface InventoryContextProps {
    isLoading: boolean;
    products: ProductT[];
    addProduct: (displayName: string, internalPrice: number, icon?: string) => Promise<boolean>;
    updateProduct: (updatedProduct: ProductT) => Promise<boolean>;
    deleteProduct: (id: Id) => Promise<boolean>;
    toggleFavourite: (id: Id) => Promise<boolean>;
    refillProduct: (id: Id, amount: number) => Promise<boolean>;
    getProductById: (id: Id) => ProductT;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<ProductT[]>([]);

    const fetchInventory = async () => {
        try {
            const apiItems: ApiItem[] = await inventoryApi.getInventory();
            const newProducts = apiItems.map(productAdapter);
            setProducts(newProducts);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        }
    };

    useEffect(() => {
        fetchInventory();
        setIsLoading(false);
    }, []);

    const getProductById = (id: Id): ProductT => {
        const product = products.find(product => product.id === id);
        if (!product) throw new Error(`Product with id ${id} not found`);
        return product;
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
            console.error('Failed to add product', error);
            return false;
        }
    };

    const updateProduct = async (updatedProduct: ProductT): Promise<boolean> => {
        const product = products.find(product => product.id === updatedProduct.id);
        if (!product) throw new Error('Product not found');

        const updatedFields: Partial<ApiItem> = {};

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
            const success = await inventoryApi.updateProduct(updatedProduct.id, updatedFields);
            fetchInventory();
            return success;
        }
        return false;
    };

    const refillProduct = async (id: Id, amount: number): Promise<boolean> => {
        const product = products.find(product => product.id === id);
        if (!product) throw new Error('Product not found');

        const success = await inventoryApi.refillProduct(id, amount);
        if (success) {
            fetchInventory();
        }
        return success;
    }

    const toggleFavourite = async (id: Id): Promise<boolean> => {
        const product = products.find(product => product.id === id);
        if (!product) throw new Error('Product not found');

        const updatedProduct: ProductT = { ...product, favorite: !product.favorite };

        const success = await updateProduct(updatedProduct);
        if (success) {
            fetchInventory();
        }
        return success;
    }

    const deleteProduct = async (id: Id): Promise<boolean>  => {
        if (!products.some(product => product.id === id)) throw new Error('Product not found');
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

