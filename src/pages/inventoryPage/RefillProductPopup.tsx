import React, { useState } from 'react';
import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useInventory } from '../../contexts/InventoryContext';

interface RefillProductPopupProps {
    product: ProductT;
    isOpen: boolean;
    onClose: () => void;
}

const RefillProductPopup: React.FC<RefillProductPopupProps> = ({ product, isOpen, onClose }) => {
    const [amount, setAmount] = useState<number>(0);
    const { changeProductAmount } = useInventory();
    const [ errorText, setErrorText ] = useState<string | null>('');

    const handleClose = () => {
        setAmount(0);
        setErrorText(null);
        onClose();
    }

    return (
        <PopupDiv 
            title='Fyll på produkt'
            isOpen={isOpen}
            onClose={handleClose}
            onAccept={() => changeProductAmount(product.id, amount)}
            acceptButtonText='Fyll på'
            errorText={'Något gick fel, försök igen senare.'}
        >
            <p>Nuvarande antal: {product.amountInStock} st</p>
            <label htmlFor="amount">Fyll på med: </label>
            <input 
                id="amount" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
            />
            <p>Nytt antal: {product.amountInStock + amount} st</p>
            {errorText && <p className="error-message">{errorText}</p>}
        </PopupDiv>
    );
}

export default RefillProductPopup;
