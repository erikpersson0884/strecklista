import React, { useState } from 'react';
import './RefillPopup.css';

import useModalContext from '@/contexts/ModalContext';
import useNotificationContext from '@/contexts/NotificationContext';

import ActionPopupWindow from '@/components/actionPopupWindow/ActionPopupWindow';
import ProductIcon from '@/components/icon/ProductIcon';


interface RefillPopupPopupProps {
    item: User | Item;
    currentBalance: number;
    suffix: string;
    refillAction: (id: string, amount: number, comment?: string) => Promise<boolean>;
}
const RefillPopup: React.FC<RefillPopupPopupProps> = ({ item, currentBalance, refillAction, suffix }) => {
    const { notify } = useNotificationContext();
    const { closeModal } = useModalContext();

    const [ amountToDeposit, setAmountToDeposit ] = useState<string>('');
    const [ comment, setComment ] = useState<string>('');
    const [ includeComment, setIncludeComment ] = useState<boolean>(false);

    const handleRefill = async () => {
        const parsedAmount = parseFloat(amountToDeposit);


        const wasSuccessFull: boolean = await refillAction(
            item.id,
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

    const newAmount: string = ((amountToDeposit !== '' ? parseFloat(amountToDeposit) : 0) + currentBalance).toString();

    return (
        <ActionPopupWindow 
            onAccept={handleRefill}
            acceptButtonText={`Fyll på med ${(amountToDeposit !== '' ? parseFloat(amountToDeposit) : 0)} ${suffix}`}
            className='refill-user-balance-popup'
            acceptButtonDisabled={amountToDeposit === '' || parseFloat(amountToDeposit) <= 0}
        >
            <header>
                <ProductIcon item={item} />
                <div>
                    <h2>{item.name}</h2>
                    {'nick' in item && <p>{item.nick}</p>}
                </div>
            </header>
            <p className="balance-row">
                <span>Nuvarande saldo:</span> 
                <span>{currentBalance}</span>
                <span>{suffix}</span>
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
                    <p>{suffix}</p>
                </div>
            </div>

            <p className="balance-row new-balance">
                <span>Nytt saldo:</span>
                <span>
                    {newAmount}
                </span>
                <span>{suffix}</span>
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

export default RefillPopup;
