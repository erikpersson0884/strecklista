import React from 'react';
import TransactionsItem from './TransactionItem';

interface PurchaseItemProps {
    purchase: Purchase;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase }) => {
    return (
        <TransactionsItem
            transaction={purchase}
            transactionType='Köp'
            previewName={purchase.createdFor.nick}
            total={purchase.total}
        >
            <div>
                <p>Datum: {new Date(purchase.createdTime).toISOString().split('T')[0]}</p>

                <br />
                <p>Streckat av: {purchase.createdBy.nick}</p>
                <p>Streckat på: {purchase.createdFor.nick}</p>
            </div>

            <div>
                <ul className='receipt-list'>
                    <li className='receipt-item'>
                        <p>Vara</p>
                        <p>Antal</p>
                        <p>Pris</p>
                        <p>Totalt</p>
                    </li>
                    <hr />
                    {purchase.items.map((item,index) => (
                        <li className='receipt-item' key={index}>
                            <p>{item.item.displayName}</p>
                            <p>{item.quantity} st</p>
                            <p>{item.purchasePrice.price} kr</p>
                            <p>{item.purchasePrice.price * item.quantity} kr</p>
                        </li>
                    ))}
                    <li className='receipt-item total'>
                        <p>Totalt</p>
                        <p>{purchase.total}kr</p>
                    </li>
                </ul>
            </div>
        </TransactionsItem>
    );
};

export default PurchaseItem;
