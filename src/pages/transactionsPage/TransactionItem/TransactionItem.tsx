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
        const purchase: Purchase = transaction as Purchase;
        total = purchase.items.reduce((acc, item) => acc + Number(item.purchasePrice.price) * item.quantity, 0);
    } else if (transaction.type === 'deposit') {
        total = (transaction as Deposit).total;
    }
    

    if (!showDetails) return (
        <li className="transaction-item transaction-item-preview">
            <div>
                <p>{new Date(transaction.createdTime).toISOString().split('T')[0]}</p>
                <p>{total}kr</p> 
            </div>
            <div>
                <p>{transaction.createdFor.nick}</p>
                -
                <p>{transaction.type == "purchase"? "Köp" : "Påfyllning"}</p>

                <button className='show-detailed-button' onClick={() => setShowDetails(true)}>Expandera</button>
            </div>
        </li>
    )

    if (transaction.type === 'purchase') return (
        <PurchaseItem purchase={transaction as Purchase} closeDetails={() => setShowDetails(false)} />
    )

    if (transaction.type === 'deposit') return (
        <DepositItem deposit={transaction as Deposit} closeDetails={() => setShowDetails(false)} />
    )
}   

export default TransactionsItem;