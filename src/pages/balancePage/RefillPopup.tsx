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

    const [errorText, setErrorText] = useState<string | null>(null);
    const [amountToDeposit, setAmountToDeposit] = useState<string>(''); // Use string

    const handleRefill = async () => {
        const parsedAmount = parseFloat(amountToDeposit);

        if (isNaN(parsedAmount)) {
            setErrorText('Ange ett giltigt belopp.');
            return;
        }

        const wasSuccessFull: boolean = await addUserBalance(user.id, parsedAmount);
        
        if (wasSuccessFull) handleClose();
        else setErrorText('Något gick fel, försök igen senare.');
    };

    const handleClose = () => {
        setAmountToDeposit('');
        setErrorText(null);
        onClose();
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmountToDeposit(e.target.value);
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

            <div className='inputdiv'>
                <label htmlFor="amount">Fyll på med: </label>
                <input 
                    id="amount" 
                    type="number" 
                    value={amountToDeposit} 
                    step="100"
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyPress}
                />  
            </div>
            
            <p>Nytt saldo: {user.balance + (parseFloat(amountToDeposit) || 0)}kr</p>

            {errorText && <p className="error-message">{errorText}</p>}
        </PopupDiv>
    );
}

export default RefillPopup;
