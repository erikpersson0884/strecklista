import React, { useState } from 'react';
import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useInventory } from '../../contexts/InventoryContext';

interface RefillProductPopupProps {
    product: ProductT;
    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
}

const RefillProductPopup: React.FC<RefillProductPopupProps> = ({ product, showPopupDiv, setShowPopupDiv }) => {
    const [amount, setAmount] = useState<number>(0);
    const { changeProductAmount } = useInventory();
    const [ errorText, setErrorText ] = useState<string | null>('');

    const handleRefill = async () => {
        const wasSuccesfull: boolean = await changeProductAmount(product.id, amount);
        
        if (!wasSuccesfull) setErrorText('Något gick fel, försök igen senare.');
        else {
            // Reset and close popup
            setAmount(0);
            setShowPopupDiv(false);
            setErrorText(null);
        }
    };

    const handleClose = () => {
        setAmount(0);
    }

    return (
        <PopupDiv 
            title='Fyll på produkt'
            isOpen={showPopupDiv}
            onClose={handleClose}
            onAccept={handleRefill}
            onCancel={handleClose}
            acceptButtonText='Fyll på'

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
