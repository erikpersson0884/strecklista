import React from 'react';
import './TransactionsPage.css';
import { useTransactionsContext } from '../../contexts/TransactionsContext';
import PurchaseItem from './TransactionItem/PurchaseItem';
import DepositItem from './TransactionItem/DepositItem';
import StockUpdateItem from './TransactionItem/StockUpdateItem';


import Filter from './Filter/Filter';

const TransactionsPage: React.FC = () => {
    const { 
        isLoading,
        filteredTransactions, 
        getNextTransactions, 
        getPrevTransactions,
        transactionsPageNumber
    } = useTransactionsContext();

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className='transactions-page'>
            <Filter />

            <ul className='transactions-list'>
                {filteredTransactions.map((transaction: Transaction) => 
                    <TransactionItem key={transaction.id} transaction={transaction} />
                )}
            </ul>

            <footer className='pagination'>
                <button disabled={transactionsPageNumber <= 1} className='prev-button' onClick={getPrevTransactions}>&lt;</button>
                <span className='page-number'>{transactionsPageNumber}</span>
                <button className='next-button' onClick={getNextTransactions}>&gt;</button>
            </footer>

        </div>
    );
};

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    if (transaction.type === 'purchase') return (
        <PurchaseItem purchase={transaction as Purchase}/>
    )
    if (transaction.type === 'deposit') return (
        <DepositItem deposit={transaction as Deposit}/>
    )
    if (transaction.type === 'stockUpdate') return (
        <StockUpdateItem stockUpdate={transaction as StockUpdate}/>
    )
    else {
        console.error("Unknown transaction type:", transaction.type);
        return <li className="transaction-item">Unknown transaction type</li>;
    }
}

export default TransactionsPage;
