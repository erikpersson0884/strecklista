import React from 'react';
import TransactionsItem from './TransactionItem/TransactionItem';
import { useTransactionsContext } from '../../contexts/TransactionsContext';
import './TransactionsPage.css';

import Filter from './Filter/Filter';

const TransactionsPage: React.FC = () => {
    const { filteredTransactions, getNextTransactions, getPrevTransactions } = useTransactionsContext();

    return (
        <div className='transactions-page'>
            <Filter />

            {filteredTransactions.length > 0 ?
                <ul className='transactions-list'>
                    {filteredTransactions.map((transaction: Transaction) => 
                        <TransactionsItem key={transaction.id} transaction={transaction} />
                    )}
                </ul>
            :
                <p>No transactions to show</p>
            }
        </div>
    );
};


export default TransactionsPage;