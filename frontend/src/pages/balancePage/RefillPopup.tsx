import React, { useState } from 'react';

import PopupDiv from '../../components/PopupDiv/PopupDiv';

import { User } from '../../Types';

import { useUsersContext } from '../../contexts/UsersContext';

interface RefillPopupProps {
    user: User;
    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
}

const RefillPopup: React.FC<RefillPopupProps> = ({ user, showPopupDiv, setShowPopupDiv }) => {
    const [amountToDeposit, setAmountToDeposit] = useState<number>(0);
    const { addUserBalance } = useUsersContext();

    const handleRefill = () => {
        addUserBalance(user.id, amountToDeposit);
        
        // Reset and close popup
        setShowPopupDiv(false);
        handleClose();
    };

    const handleClose = () => {
        setAmountToDeposit(0);
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
            doAction={handleRefill}
            showPopupDiv={showPopupDiv}
            setShowPopupDiv={setShowPopupDiv}
            cancelAction={handleClose}
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
        </PopupDiv>
    );
}

export default RefillPopup;
