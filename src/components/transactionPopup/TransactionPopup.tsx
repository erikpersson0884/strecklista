import { useState, type FC } from "react";
import './TransactionPopup.css';

import { useTransactionsContext } from "../../contexts/TransactionsContext";

import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";
import PopupWindow from "../popupWindow/PopupWindow";


interface TransactionPopupProps {
    transaction: ITransaction | null;
    onClose: () => void;
}

const TransactionPopup: FC<TransactionPopupProps> = ({transaction, onClose}) => {
    if (!transaction) return null;

    const { deleteTransaction } = useTransactionsContext();

    const Details: FC = () => {
        if (transaction.type === 'purchase') {
            const purchase = transaction as Purchase;

            return (
                <div className="receipt-details">
                    <br />
                    <p>Detaljer</p>
                    <hr />
                    <ul className='receipt-list'>
                        {purchase.items.map((item,index) => (
                            <li className='receipt-item' key={index}>
                                <p>{item.item.displayName}</p>
                                <p>x{item.quantity}</p>
                                <p className="item-total">{item.purchasePrice.price * item.quantity} kr</p>
                            </li>
                        ))}
                    </ul>

                    <hr />
                    <p className='total'>
                        <span>Totalt</span>
                        <span>{purchase.total}kr</span>
                    </p>
            </div>
            );
        }
        else if (transaction.type === 'stockUpdate') {
            const stockUpdate = transaction as StockUpdate;
            return (
                <div>
                    <br />
                    <p>Detaljer</p>
                    <hr />
                    <ul className='receipt-list'>
                        {stockUpdate.items.map((item,index) => (
                            <li key={index} className='receipt-item'>
                                <p>{item.name}</p>
                                <p>{item.after - item.before} st</p>
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        else if (transaction.type === 'deposit') {
            return null; // No additional details for deposits
        }
        else {
            return <p>Unknown transaction type</p>;
        }
    };

    const [ errorText, setErrorText ] = useState<string | undefined>("");

    const handleDelete = async () => {
        try {
            await deleteTransaction(transaction.id);
            setErrorText(undefined);
            onClose();
        } catch (error) {
            setErrorText("Något gick fel, försök igen senare.");
        }
    }
    let dateString: string;
    let timeString: string;
    const d = new Date(transaction.createdTime);
    if (isNaN(d.getTime())) {
        dateString = String(transaction.createdTime);
        timeString = '';
    } else {
        const pad = (n: number) => String(n).padStart(2, '0');
        dateString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        timeString = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    let transactionTypeString: string;
    switch (transaction.type) {
        case 'purchase': 
            transactionTypeString = 'Köp';
            break;
        case 'deposit':
            transactionTypeString = 'Insättning';
            break;
        case 'stockUpdate':
            transactionTypeString = 'Lageruppdatering';
            break;
        default:
            transactionTypeString = 'Okänd';
    }

    let comment: string | null = null;
    if (transaction.type === 'purchase' || transaction.type === 'deposit') comment = (transaction as Purchase | Deposit).comment;

    const PopupContent: FC = () => {
        return (
            <>
                <div className="transaction-overview">
                    <p>
                        <span>Typ av transaktion:</span>
                        <span>{transactionTypeString}</span>
                    </p>
                    
                    <div>
                        <p>
                            <span>Datum:</span>
                            <span>{dateString}</span>
                        </p>

                        <p>
                            <span>Klockslag:</span>
                            <span>{timeString}</span>
                        </p>
                    </div>  

                    <div>
                        { 'createdFor' in transaction && (
                            <p>
                                <span>Berört konto:</span>
                                <span>{(transaction.createdFor as { nick: string }).nick}</span>
                            </p>
                        )}

                        <p>
                            <span>Utförd av:</span>
                            <span>{transaction.createdBy ? transaction.createdBy.nick : 'N/A'}</span>
                        </p>
                    </div>
                    
                    { comment && (
                        <p className="comment-container">
                            <span>Kommentar:</span>
                            <span className="comment">{comment}</span>
                        </p>
                    )}
                    

                    <p>
                        <span>Summa:</span>
                        <span>{'total' in transaction ? transaction.total + ' kr' : 'N/A'}</span>
                    </p>
                </div>

                <Details />
            </>
        )
    }

    if (transaction.removed) return (
        <PopupWindow
            isOpen={!!transaction}
            onClose={onClose}
            title="Transaktion"
            className="transaction-popup"
        >
            <PopupContent />
        </PopupWindow>
    )
    else return (
        <ActionPopupWindow
            isOpen={!!transaction}
            onClose={onClose}
            title="Transaktion"
            className="transaction-popup"
            acceptButtonText="Stryk Transaktion"
            onAccept={handleDelete}
            errorText={errorText}
        >
           <PopupContent />
        </ActionPopupWindow>
    )
}

export default TransactionPopup;
