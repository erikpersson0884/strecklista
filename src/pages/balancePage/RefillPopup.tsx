import React, { useState } from 'react';

import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useUsersContext } from '../../contexts/UsersContext';

interface RefillPopupProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

const RefillPopup: React.FC<RefillPopupProps> = ({ user, isOpen, onClose }) => {
    const { addUserBalance } = useUsersContext();

    const [ errorText, setErrorText ] = useState<string | null>(null);
    const [amountToDeposit, setAmountToDeposit] = useState<number>(0);

    const handleRefill = async () => {
        const wasSuccessFull: boolean = await addUserBalance(user.id, amountToDeposit);
        
        if (wasSuccessFull) handleClose();
        else setErrorText('Något gick fel, försök igen senare.');
    };

    const handleClose = () => {
        setAmountToDeposit(0);
        setErrorText(null);
        onClose();
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log( typeof e.target.value);
        const amount = parseFloat(e.target.value);
        if (isNaN(amount)) return;
        else setAmountToDeposit(amount);
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRefill();
        }
    }

    return (
        <PopupDiv 
            title={`Fyll på ${user.nick}`} 
            onAccept={handleRefill}
            isOpen={isOpen}
            onClose={handleClose}
        >
            <p>Nuvarande saldo: {user.balance}kr</p>
            <label htmlFor="amount">Fyll på med: </label>
            <input 
                id="amount" 
                type="number" 
                value={amountToDeposit} 
                step="100"
                onChange={(e) => handleInputChange(e)} 
                onKeyDown={handleKeyPress}
            />  
            <p>Nytt saldo: {user.balance + (amountToDeposit)}kr</p>

            {errorText && <p className="error-message">{errorText}</p>}
        </PopupDiv>
    );
}

export default RefillPopup;
