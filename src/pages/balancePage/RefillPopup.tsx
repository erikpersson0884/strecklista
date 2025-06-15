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

    const MAX_COMMENT_LENGTH = 1000;

    const [errorText, setErrorText] = useState<string | null>(null);
    const [amountToDeposit, setAmountToDeposit] = useState<number>(0); // Use string
    const [comment, setComment] = useState<string>('');
    const [ includeComment, setIncludeComment ] = useState<boolean>(false);

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
        setErrorText(null);
        onClose();
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

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newComment: string = e.target.value;
        if (!validateComment(newComment)) return;
        setComment(newComment);
        setErrorText(null);
    }

    const validateComment = (comment: string) => {
        if (comment.length > MAX_COMMENT_LENGTH) {
            setErrorText(`Kommentaren får max vara ${MAX_COMMENT_LENGTH} tecken lång`);
            return false;
        }
        return true;
    };

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
                    type="string" 
                    value={amountToDeposit} 
                    onChange={handleInputChange} 
                    onKeyDown={handleKeyPress}
                    placeholder="Ange belopp här..."
                />  
            </div>
            
            <p>Nytt saldo: <span style={{ color: 'greeen' }}>
                {(user.balance + amountToDeposit).toLocaleString('sv-SE')}</span>kr
            </p>


            { includeComment ? (
                <>
                    <hr />
                    <div className='deposit-comment-header'>
                        <label htmlFor="comment">Kommentar (valfritt): </label>
                        <button onClick={() => { setErrorText(null); setIncludeComment(false)}}>Ingen Kommentar</button>
                    </div>
                    <input
                        id="comment" 
                        type="text" 
                        value={comment} 
                        onChange={handleCommentChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Skriv en kommentar här..."
                    /> 
                </>
            ) : (
                <button onClick={() => setIncludeComment(true)}>Lägg till kommentar</button>
            )}


            {errorText && <p className="error-message">{errorText}</p>}
        </PopupDiv>
    );
}

export default RefillPopup;
