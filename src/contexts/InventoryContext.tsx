import { createContext, useState, useContext, ReactNode } from 'react';
import inventoryApi from '@/api/inventoryApi';
import { useEffect } from 'react';
import useAuthContext from './AuthContext';
import { useNotificationContext } from './NotificationContext';


interface InventoryContextProps {
    isLoadingInventory: boolean;
    items: Item[];
    addItem: (displayName: string, internalPrice: number, icon?: string) => Promise<Item | null>;
    updateItem: (id: Id, updatedItem: Item) => Promise<Item | null>;
    deleteItem: (id: Id) => Promise<boolean>;
    toggleFavourite: (id: Id) => Promise<Item | null>;
    refillItem: (id: Id, amount: number) => Promise<boolean>;
    getItemById: (id: Id) => Item;
}

const InventoryContext = createContext<InventoryContextProps | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuthContext();
    const { notify } = useNotificationContext();

    const [isLoadingInventory, setIsLoadingInventory] = useState<boolean>(true);
    const [items, setItems] = useState<Item[]>([]);

    const fetchInventory = async () => {
        try {
            const newItems: Item[] = await inventoryApi.getInventory();
            setItems(newItems);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        }
    };

    useEffect( () => {
        if (!isAuthenticated) return;

        setIsLoadingInventory(true);
        fetchInventory();
        setIsLoadingInventory(false);
    }, [isAuthenticated]);

    const getItemById = (id: Id): Item => {
        const item = items.find(item => item.id === id);
        if (!item) throw new Error(`Item with id ${id} not found (in inventory context)`);
        return item;
    };

    const addItem = async (displayName: string, internalPrice: number, icon?: string): Promise<Item | null> => {
        try {
            const prices = [{
                displayName: "Internt",
                price: internalPrice
            }];

            const item: Item = await inventoryApi.addItem(displayName, prices, icon);
            fetchInventory();
            return item;
        } catch (error) {
            console.error('Failed to add item', error);
            notify(`Misslyckades med att lägga till vara "${displayName}"`, 'error');
            return null;
        }
    };

    const updateItem = async (itemId: Id, updatedItem: Partial<Item>): Promise<Item | null> => {
        try {
            const existingItem = items.find(item => item.id === itemId)
            if (!existingItem) {
                notify(`Vara med id "${updatedItem.id}" hittades inte i inventariet`, 'error');
                throw new Error(`Item with id ${updatedItem.id} not found (in inventory context)`);
            }

            const itemHasChanged = Object.keys(updatedItem).some(key => { // Check if any property has changed
                return updatedItem[key as keyof Item] !== existingItem[key as keyof Item];
            });

            if (!itemHasChanged) {
                notify(`Inga ändringar gjordes på vara "${existingItem.name}"`, 'info');
                return existingItem; // Return the existing item if no changes were made
            }

            const newItem: Item = await inventoryApi.updateItem(itemId, updatedItem)
            fetchInventory();
            notify(`Vara "${newItem.name}" har uppdaterats`, 'success')
            return newItem
        } catch (error) {
            console.error('Failed to update item', error);
            notify(`Misslyckades med att uppdatera vara med id "${itemId}"`, 'error');
            return null;
        }
    };

    const refillItem = async (id: Id, amount: number): Promise<boolean> => {
        try {
            const item = items.find(item => item.id === id);
            if (!item) throw new Error('Item not found');

            await inventoryApi.refillItem(id, amount);
            fetchInventory();
            notify(`Vara påfylld`, 'success');
            return true;
        } catch (error) {
            notify(`Misslyckades med att fylla på vara med id "${id}"`, 'error');
            return false;
        }
    }

    const toggleFavourite = async (id: Id): Promise<Item | null> => {
        try {
            const itemToUpdate = items.find(item => item.id === id);
            if (!itemToUpdate) throw new Error('Item not found');

            const updatedItem: Item = { ...itemToUpdate, favorite: !itemToUpdate.favorite };

            const item = await inventoryApi.updateItem(id, updatedItem);
            fetchInventory();
            
            return item;
        } catch (error) {
            notify(`Misslyckades med att uppdatera favoritstatus för vara med id "${id}"`, 'error');
            return null;
        }
    }

    const deleteItem = async (id: Id): Promise<boolean>  => {
        if (!items.some(item => item.id === id)) throw new Error('Item not found');
        await inventoryApi.deleteItem(id);
        fetchInventory();
        return true;
    }

    return (
        <InventoryContext.Provider value={{ 
            isLoadingInventory, 
            items, 
            addItem, 
            updateItem, 
            deleteItem, 
            toggleFavourite,
            refillItem,
            getItemById
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventoryContext = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('useInventoryContext must be used within an InventoryProvider');
    }
    return context;
};

export default useInventoryContext;
