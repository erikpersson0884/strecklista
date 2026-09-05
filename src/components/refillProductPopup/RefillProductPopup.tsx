import React, { useState } from 'react';
import ActionPopupWindow from '@/components/actionPopupWindow/ActionPopupWindow';
import { useInventoryContext } from '@/contexts/InventoryContext';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useModalContext } from '@/contexts/ModalContext';


interface RefillProductPopupProps {
    item: Item;
}

const RefillProductPopup: React.FC<RefillProductPopupProps> = ({ item }) => {
    const { refillItem } = useInventoryContext();
    const { notify } = useNotificationContext();
    const { closeModal } = useModalContext();

    const [amountToRefill, setAmountToRefill] = useState<number>(0);

    const handleRefillProduct = async () => {
        const wasSuccessfull = await refillItem(item.id, amountToRefill);
        if (wasSuccessfull) closeModal();
        else notify("Det gick inte att fylla på varan", "error");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Ignore anything that isn't a number
        if (!/^\d*$/.test(value)) return;
        
        setAmountToRefill(value === '' ? 0 : Number(value));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRefillProduct();
        }
    };

    return (
        <ActionPopupWindow 
            title={`Fyll på ${item.name}`}
            onAccept={handleRefillProduct}
            acceptButtonText='Fyll på'
        >
            <p>Nuvarande antal: {item.amountInStock} st</p>
            <label htmlFor="amount">Fyll på med: </label>
            <input 
                id="amount" 
                type="string" 
                inputMode="numeric"
                value={amountToRefill} 
                onChange={handleInputChange} 
                onKeyDown={handleKeyDown}
            />
            <p>Nytt antal: {item.amountInStock + amountToRefill} st</p>
        </ActionPopupWindow>
    );
}

export default RefillProductPopup;
