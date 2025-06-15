import React from 'react';
import './TransactionItem.css';
import deleteIcon from '../../../assets/images/delete-white.svg';
import DeleteTransactionPopup from '../DeleteTransactionPopup';

interface TransactionsItemProps {
    children: React.ReactNode;
    transaction: Transaction;
    transactionType: string;
    previewName: string;
    total?: number;
}

const TransactionsItem: React.FC<TransactionsItemProps> = ({ transaction, total, previewName, transactionType, children }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const [showPopupDiv, setShowPopupDiv] = React.useState(false);

    if (!showDetails) return (
        <li className="transaction-item transaction-item-preview">
            <div>
                <p>{new Date(transaction.createdTime).toISOString().split('T')[0]}</p>
                <p>|</p>
                <p>{previewName}</p>
            </div>
            <div>
                <p>{transactionType}</p>
                {total && ( 
                    <>
                        <p>|</p>
                        <p>{total}kr</p>
                    </>
                )} 

                <button className='show-detailed-button' onClick={() => setShowDetails(true)}>Expandera</button>
            </div>
        </li>
    )

    else return (
        <>
            <li className="transaction-item-detailed transaction-item">
                <button onClick={() => setShowPopupDiv(true)} className="delete-button">
                    <img src={deleteIcon} alt="Delete" />
                </button>

                {children}

                <button onClick={() => setShowDetails(false)}>Visa mindre</button>
            </li>
            <DeleteTransactionPopup
                transaction={transaction}
                isOpen={showPopupDiv}
                onClose={() => setShowPopupDiv(false)}
            />
        </>
    );

    // if (transaction.type === 'purchase') return (
    //     <PurchaseItem purchase={transaction as Purchase} closeDetails={() => setShowDetails(false)} />
    // )

    // if (transaction.type === 'deposit') return (
    //     <DepositItem deposit={transaction as Deposit} closeDetails={() => setShowDetails(false)} />
    // )
    // if (transaction.type === 'stockUpdate') return (
    //     <StockUpdateItem stockUpdate={transaction as StockUpdate} closeDetails={() => setShowDetails(false)} />
    // )
    // else {
    //     console.error("Unknown transaction type:", transaction.type);
    //     return <li className="transaction-item">Unknown transaction type</li>;
    // }
}   

export default TransactionsItem;