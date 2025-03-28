import React from 'react';
import PurchaseItem from './PurchaseItem';
import DepositItem from './DepositItem';
import './TransactionItem.css';

interface TransactionsItemProps {
    transaction: Transaction;
}

const TransactionsItem: React.FC<TransactionsItemProps> = ({ transaction }) => {
    const [showDetails, setShowDetails] = React.useState(false);

    let total = 0;
    if (transaction.type === 'purchase') {
        const purchase = transaction as Purchase;
        total = purchase.items.reduce((acc, item) => acc + Number(item.purchasePrice.price) * item.quantity, 0);
    } else if (transaction.type === 'deposit') {
        total = (transaction as Deposit).total;
    }

    
    return (
        <>
            {!showDetails ? (
            <li className="transaction-item transaction-item-preview">
                <div>
                    <p>{new Date(transaction.createdTime).toISOString().split('T')[0]}</p>
                    <p>{transaction.type == "purchase"? "Köp" : "Påfyllning"}</p>
                </div>
                <div>
                    <p>{transaction.createdFor.nick}</p>
                    <p>{total}kr</p> 
                    <button className='showDetailed-button' onClick={() => setShowDetails(true)}>Expandera</button>
                </div>
            </li>
            ) : (
            transaction.type === 'purchase' ? (
                <PurchaseItem purchase={transaction as Purchase} closeDetails={() => setShowDetails(false)} />
            ) : transaction.type === 'deposit' ? (
                <DepositItem deposit={transaction as Deposit} closeDetails={() => setShowDetails(false)} />
            ) : null
            )}
        </>
    )
}   

export default TransactionsItem;