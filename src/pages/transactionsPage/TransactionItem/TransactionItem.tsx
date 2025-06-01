import React from 'react';
import PurchaseItem from './PurchaseItem';
import DepositItem from './DepositItem';
import StockUpdateItem from './StockUpdateItem';
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

    let transactionType = '';
    if (transaction.type === 'purchase') {
        transactionType = 'Köp';
    } else if (transaction.type === 'deposit') {
        transactionType = 'Påfyllning';
    } else if (transaction.type === 'stockUpdate') {
        transactionType = 'Varupåfyllning';
    }

    let previewName = '';
    if (transaction.type === 'purchase' || transaction.type === 'deposit') {
        const purchase: Purchase = transaction as Purchase;
        previewName = purchase.createdFor.nick;
    } else if (transaction.type === 'stockUpdate') {
        const stockUpdate: StockUpdate = transaction as StockUpdate;
        previewName = stockUpdate.createdBy.nick;
    } else throw new Error(`Unknown transaction type: ${transaction.type}`);

    if (!showDetails) return (
        <li className="transaction-item transaction-item-preview">
            <div>
                <p>{new Date(transaction.createdTime).toISOString().split('T')[0]}</p>
                <p>|</p>
                <p>{total}kr</p> 
            </div>
            <div>
                <p>{previewName}</p>
                |
                <p>{transactionType}</p>

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
    if (transaction.type === 'stockUpdate') return (
        <StockUpdateItem stockUpdate={transaction as StockUpdate} closeDetails={() => setShowDetails(false)} />
    )
    else {
        console.error("Unknown transaction type:", transaction.type);
        return <li className="transaction-item">Unknown transaction type</li>;
    }
}   

export default TransactionsItem;