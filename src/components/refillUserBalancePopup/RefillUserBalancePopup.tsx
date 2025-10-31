import React, { useState } from 'react';
import './RefillUserBalancePopup.css';

import ActionPopupWindow from '../actionPopupWindow/ActionPopupWindow';
import { useUsersContext } from '../../contexts/UsersContext';

interface RefillUserBalancePopupProps {
    user: User;
}

const RefillUserBalancePopup: React.FC<RefillUserBalancePopupProps> = ({ user }) => {
    const { addUserBalance } = useUsersContext();

    const MAX_COMMENT_LENGTH = 1000;

    const [errorText, setErrorText] = useState<string | undefined>(undefined);
    const [amountToDeposit, setAmountToDeposit] = useState<number>(0); // Use string
    const [comment, setComment] = useState<string>('');
    const [includeComment, setIncludeComment] = useState<boolean>(false);

    const handleRefill = async () => {
        // const parsedAmount = parseFloat(amountToDeposit);
        const parsedAmount = amountToDeposit;

        if (isNaN(parsedAmount)) {
            setErrorText('Ange ett giltigt belopp.');
            return;
        }

        if (includeComment && !validateComment(comment)) return;

        const wasSuccessFull: boolean = await addUserBalance(
            user.id,
            parsedAmount,
            includeComment ? comment : undefined
        );
        
        if (wasSuccessFull) handleClose();
        else setErrorText('Något gick fel, försök igen senare.');
    };

    const handleClose = () => {
        setAmountToDeposit(0);
        setErrorText(undefined);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const parsed = parseFloat(value);

        if (value.trim() === '' || isNaN(parsed)) {
            setAmountToDeposit(0);
        } else {
            setAmountToDeposit(parsed);
        }
    };


    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRefill();
        }
    }

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newComment: string = e.target.value;
        if (!validateComment(newComment)) return;
        setComment(newComment);
        setErrorText(undefined);
    }

    const validateComment = (comment: string) => {
        if (comment.length > MAX_COMMENT_LENGTH) {
            setErrorText(`Kommentaren får max vara ${MAX_COMMENT_LENGTH} tecken lång`);
            return false;
        }
        return true;
    };

    return (
        <ActionPopupWindow 
            title={user.nick}
            onAccept={handleRefill}
            onClose={handleClose}
            acceptButtonText="Fyll på"
            className='refill-user-balance-popup'
            errorText={errorText}
        >
            <p>
                <span>Nuvarande saldo:</span> 
                <span>{user.balance}</span>
                <span>kr</span>
            </p>

            <div>
                <label htmlFor="amount">Fyll på med: </label>
                <input 
                    id="amount" 
                    type="string" 
                    value={amountToDeposit} 
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyPress}
                    placeholder="Ange belopp här..."
                />
                <p>kr</p>
            </div>
            
            <p>
                <span>Nytt saldo:</span>
                <span style={{ color: 'greeen' }}>
                    {(user.balance + amountToDeposit).toLocaleString('sv-SE')}
                </span>
                <span>kr</span>
            </p>


            { includeComment ? (
                <>
                    <hr />
                    <div>
                        <label htmlFor="comment">Kommentar (valfritt): </label>
                        <button onClick={() => { setErrorText(undefined); setIncludeComment(false)}}>Ingen Kommentar</button>
                    </div>
                    <textarea
                        id="comment" 
                        value={comment} 
                        onChange={handleCommentChange}
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
