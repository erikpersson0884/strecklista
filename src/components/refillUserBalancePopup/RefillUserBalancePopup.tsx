import React, { useState } from 'react';
import './RefillUserBalancePopup.css';

import ActionPopupWindow from '@/components/actionPopupWindow/ActionPopupWindow';
import { useUsersContext } from '@/contexts/UsersContext';
import useModalContext from '@/contexts/ModalContext';
import useNotificationContext from '@/contexts/NotificationContext';


interface RefillUserBalancePopupProps {
    user: User;
}
const RefillUserBalancePopup: React.FC<RefillUserBalancePopupProps> = ({ user }) => {
    const { addUserBalance } = useUsersContext();
    const { notify } = useNotificationContext();
    const { closeModal } = useModalContext();

    const [amountToDeposit, setAmountToDeposit] = useState<string>(''); // Use string
    const [comment, setComment] = useState<string>('');
    const [includeComment, setIncludeComment] = useState<boolean>(false);

    const handleRefill = async () => {
        const parsedAmount = parseFloat(amountToDeposit);

        const wasSuccessFull: boolean = await addUserBalance(
            user.id,
            parsedAmount,
            includeComment ? comment : undefined
        );
        
        if (wasSuccessFull) closeModal();
        else notify('Något gick fel, försök igen senare.');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newInput: string = e.target.value.replace(/[^0-9.]/g, '');
        setAmountToDeposit(newInput);
    };


    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRefill();
        }
    }

    const newAmount: string = ((amountToDeposit !== '' ? parseFloat(amountToDeposit) : 0) + user.balance).toString();

    return (
        <ActionPopupWindow 
            onAccept={handleRefill}
            acceptButtonText={`Fyll på med ${newAmount} kr`}
            className='refill-user-balance-popup'
        >
            <header>
                <img className='user-icon' src={user.icon} alt={`${user.name}'s profilbild`} />
                <div>
                    <h2>{user.nick}</h2>
                    <p>{user.name}</p>
                </div>
            </header>
            <p className="balance-row">
                <span>Nuvarande saldo:</span> 
                <span>{user.balance}</span>
                <span>kr</span>
            </p>

            <div className="amount-row">
                <label htmlFor="amount">Fyll på med: </label>
                <div>
                    <input 
                        id="amount" 
                        type="string" 
                        value={amountToDeposit} 
                        onChange={handleInputChange} 
                        onKeyDown={handleKeyPress}
                        placeholder="0"
                    />
                    <p>kr</p>
                </div>
            </div>

            <p className="balance-row new-balance">
                <span>Nytt saldo:</span>
                <span>
                    {newAmount}
                </span>
                <span>kr</span>
            </p>


            { includeComment ? (
                <>
                    <div className="comment-header">
                        <label htmlFor="comment">Kommentar (valfritt): </label>
                        <button onClick={() => { setIncludeComment(false)} }>Ingen Kommentar</button>
                    </div>
                    <textarea
                        id="comment" 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Skriv en kommentar här..."
                    /> 
                </>
            ) : (
                <button className='comment-button' onClick={() => setIncludeComment(true)}>
                    <span>Lägg till kommentar</span>
                </button>
            )}
        </ActionPopupWindow>
    );
}

export default RefillUserBalancePopup;
