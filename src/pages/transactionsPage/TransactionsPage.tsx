import React from 'react';
import TransactionsItem from './TransactionItem/TransactionItem';
import { useTransactionsContext } from '../../contexts/TransactionsContext';
import './TransactionsPage.css';

import Filter from './Filter/Filter';

const TransactionsPage: React.FC = () => {
    const { 
        isLoading,
        filteredTransactions, 
        getNextTransactions, 
        getPrevTransactions 
    } = useTransactionsContext();

    const [pageNumber, setPageNumber] = React.useState<number>(1);

    const nextPage = () => {
        setPageNumber((prevPage) => prevPage + 1);
        getNextTransactions();
    }

    const prevPage = () => {
        setPageNumber((prevPage) => prevPage - 1);
        getPrevTransactions();
    }

    if (isLoading) return <p>Loading...</p>;


    // <p>No transactions to show</p>;

    return (
        <div className='transactions-page'>
            <Filter />

            <ul className='transactions-list'>
                {filteredTransactions.map((transaction: Transaction) => 
                    <TransactionsItem key={transaction.id} transaction={transaction} />
                )}
            </ul>

            <footer className='pagination'>
                <button className='prev-button' onClick={prevPage}>&lt;</button>
                <span className='page-number'>{pageNumber}</span>
                <button className='next-button' onClick={nextPage}>&gt;</button>
            </footer>

        </div>
    );
};


export default TransactionsPage;