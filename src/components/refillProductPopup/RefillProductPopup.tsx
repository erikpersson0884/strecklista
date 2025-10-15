import React, { useState } from 'react';
import ActionPopupWindow from '../actionPopupWindow/ActionPopupWindow';
import { useInventory } from '../../contexts/InventoryContext';

interface RefillProductPopupProps {
    item: IItem | null;
    onClose: () => void;
}

const RefillProductPopup: React.FC<RefillProductPopupProps> = ({ item, onClose }) => {
    if (!item) return null;
    
    const { refillProduct } = useInventory();

    const [ amountToRefill, setAmountToRefill ] = useState<number>(0);
    const [ errorText, setErrorText ] = useState<string | undefined>(undefined);

    const handleRefillProduct = async () => {
        const wasSuccessfull = await refillProduct(item.id, amountToRefill);
        if (wasSuccessfull) handleClose();
        else setErrorText("Det gick inte att fylla på varan. Kontrollera att alla fält är ifyllda korrekt.");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const parsed = parseFloat(value);

        if (value.trim() === '' || isNaN(parsed)) {
            setAmountToRefill(0);
        } else {
            setAmountToRefill(parsed);
        }
    };

    const handleClose = () => {
        setAmountToRefill(0);
        setErrorText(undefined);
        onClose();
    }

    return (
        <ActionPopupWindow 
            title={`Fyll på ${item.name}`}
            isOpen={!!item}
            onClose={handleClose}
            onAccept={handleRefillProduct}
            acceptButtonText='Fyll på'
            errorText={errorText}
        >
            <p>Nuvarande antal: {item.amountInStock} st</p>
            <label htmlFor="amount">Fyll på med: </label>
            <input 
                id="amount" 
                type="string" 
                value={amountToRefill} 
                onChange={(e) => handleInputChange(e)} 
            />
            <p>Nytt antal: {item.amountInStock + amountToRefill} st</p>
        </ActionPopupWindow>
    );
}

export default RefillProductPopup;
