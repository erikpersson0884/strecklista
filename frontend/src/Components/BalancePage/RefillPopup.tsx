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
    const [amount, setAmount] = useState<number>(0);
    const { addUserBalance } = useUsersContext();

    const handleRefill = () => {
        // if (amount <= 0) {
        //     alert('Please enter a valid amount');
        //     return;
        // } To be able to also decrease balance, this is not currently in use
        
        addUserBalance(user.id, amount);
        
        // Reset and close popup
        setAmount(0);
        setShowPopupDiv(false);
    };

    const handleClose = () => {
        setAmount(0);
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
                    onChange={(e) => setAmount(Number(e.target.value))} 
                />
                <p>Nytt saldo: {user.balance + amount}kr</p>
            </div>
        </PopupDiv>
    );
}

export default RefillPopup;
