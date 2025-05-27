import React, { useState } from 'react';
import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useInventory } from '../../contexts/InventoryContext';

interface RefillProductPopupProps {
    product: ProductT;
    isOpen: boolean;
    onClose: () => void;
}

const RefillProductPopup: React.FC<RefillProductPopupProps> = ({ product, isOpen, onClose }) => {
    const { refillProduct } = useInventory();

    const [ amountToRefill, setAmountToRefill ] = useState<number>(0);
    const [ errorText, setErrorText ] = useState<string | null>('');

    const handleRefillProduct = async () => {
        const wasSuccessfull = await refillProduct(product.id, amountToRefill);
        if (wasSuccessfull) handleClose();
        else setErrorText("Det gick inte att fylla på varan. Kontrollera att alla fält är ifyllda korrekt.");
    };

    const handleClose = () => {
        setAmountToRefill(0);
        setErrorText(null);
        onClose();
    }

    return (
        <PopupDiv 
            title='Fyll på produkt'
            isOpen={isOpen}
            onClose={handleClose}
            onAccept={handleRefillProduct}
            acceptButtonText='Fyll på'
            errorText={'Något gick fel, försök igen senare.'}
        >
            <p>Nuvarande antal: {product.amountInStock} st</p>
            <label htmlFor="amount">Fyll på med: </label>
            <input 
                id="amount" 
                type="number" 
                value={amountToRefill} 
                onChange={(e) => setAmountToRefill(Number(e.target.value))} 
            />
            <p>Nytt antal: {product.amountInStock + amountToRefill} st</p>
            {errorText && <p className="error-message">{errorText}</p>}
        </PopupDiv>
    );
}

export default RefillProductPopup;
