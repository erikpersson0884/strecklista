import React, { useState } from 'react';
import { User } from '../../Types';
import PopupDiv from '../PopupDiv/PopupDiv';
import { useUsersContext } from '../../Contexts/UsersContext';

interface RefillPopupProps {
    user: User;
    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
}

const RefillPopup: React.FC<RefillPopupProps> = ({ user, showPopupDiv, setShowPopupDiv }) => {
    const [amount, setAmount] = useState<string>('');
    const { addUserBalance } = useUsersContext();

    const handleRefill = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) {
            alert('Please enter a valid amount');
            return;
        }
        
        addUserBalance(user.id, numericAmount);
        
        // Reset and close popup
        setAmount('');
        setShowPopupDiv(false);
    };

    const handleClose = () => {
        setAmount('');
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRefill();
        }
    }

    return (
        <PopupDiv 
            title={`Fyll på ${user.nick}`} 
            doAction={handleRefill}
            showPopupDiv={showPopupDiv}
            setShowPopupDiv={setShowPopupDiv}
            cancelAction={handleClose}
        >
            <div className="refill-content">
                <p>Nuvarande saldo: {user.balance}kr</p>
                <label htmlFor="amount">Fyll på med: </label>
                <input 
                    id="amount" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => handleInputChange(e)} 
                    onKeyPress={handleKeyPress}
                />  
                <p>Nytt saldo: {user.balance + (parseFloat(amount) || 0)}kr</p>
            </div>
        </PopupDiv>
    );
}

export default RefillPopup;
