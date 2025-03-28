import React, { useState } from 'react';
import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useInventory } from '../../contexts/InventoryContext';

interface RefillProductPopupProps {
    product: Product;
    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
}

const RefillProductPopup: React.FC<RefillProductPopupProps> = ({ product, showPopupDiv, setShowPopupDiv }) => {
    const [amount, setAmount] = useState<number>(0);
    const { changeProductAmount } = useInventory();

    const handleRefill = () => {

        changeProductAmount(product.id, amount);
        
        // Reset and close popup
        setAmount(0);
        setShowPopupDiv(false);
    };

    const handleClose = () => {
        setAmount(0);
    }

    return (
        <PopupDiv 
            title={`Fyll på ${product.name}`} 
            acceptButtonText="Fyll på"
            doAction={handleRefill}
            showPopupDiv={showPopupDiv}
            setShowPopupDiv={setShowPopupDiv}
            cancelAction={handleClose}
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
        </PopupDiv>
    );
}

export default RefillProductPopup;
