import React from 'react';
import TransactionsItem from './TransactionItem';

interface StockUpdateItemProps {
    stockUpdate: StockUpdate;
}

const StockUpdateItem: React.FC<StockUpdateItemProps> = ({ stockUpdate }) => {
    return (
        <TransactionsItem
            transaction={stockUpdate}
            transactionType='Lageruppdatering'
            previewName={stockUpdate.createdBy.nick}
        >
            <div>
                <p>Datum: {new Date(stockUpdate.createdTime).toISOString().split('T')[0]}</p>
                <br />
                <p>Fyllts på utav: {stockUpdate.createdBy.nick}</p>
            </div>

            <div>
                <ul className='receipt-list'>
                    <li className='receipt-item'>
                        <p>Vara</p>
                        <p>Antal</p>
                    </li>
                    <hr />
                    {stockUpdate.items.map((item,index) => (
                        <li key={index} className='receipt-item'>
                            <p>{item.name}</p>
                            <p>{item.after - item.before} st</p>
                        </li>
                    ))}
                </ul>
            </div>
        </TransactionsItem>
    );
};

export default StockUpdateItem;
