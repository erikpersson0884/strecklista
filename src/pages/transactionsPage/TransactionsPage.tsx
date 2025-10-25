import type { FC } from 'react';
import { useState } from 'react';
import './TransactionsPage.css';

import { useTransactionsContext } from '../../contexts/TransactionsContext';

import TransactionPopup from '../../components/transactionPopup/TransactionPopup';
import DeleteTransactionPopup from '../../components/deleteTransactionPopup/DeleteTransactionPopup';

import Filter from './Filter/Filter';

import downIcon from '../../assets/images/down.svg';

const TransactionsPage: FC = () => {
    const { 
        isLoading,
        filteredTransactions, 
        getNextTransactions, 
        getPrevTransactions,
        transactionsPageNumber
    } = useTransactionsContext();

    if (isLoading) return <p>Loading...</p>;

    const [ selectedTransaction, setSelectedTransaction ] = useState<ITransaction | null>(null);
    const [ showDeletePopupDiv, setShowDeletePopupDiv ] = useState<boolean>(false);


    interface TransactionPreviewProps {
        transaction: ITransaction;
    }

    const TransactionPreview: FC<TransactionPreviewProps> = ({transaction}) => {
        return (
            <li className={`transaction-preview list-item ${transaction.removed ? 'removed-transaction' : ''}`}>
                <div className='transaction-preview-content'>
                    <div className='list-item__primary'>
                        <p>{new Date(transaction.createdTime).toISOString().split('T')[0]}</p>
                        <p>{transaction.createdBy.nick}</p>
                    </div>
                    <div className='list-item__secondary'>
                        <p>{transaction.type}</p>
                        { transaction.type === 'purchase' && ( 
                            <p>{(transaction as Purchase).total}kr</p>
                        )} 
                    </div>
                </div>
                <button className='open-popup-button' onClick={() => setSelectedTransaction(transaction)}>
                    <img src={downIcon} alt='Expandera' height={10}/>
                </button>
            </li>
        );
    }

    return (
        <>
            <div className='transactions-page page'>
                <Filter />

                <ul className='transactions-list noUlFormatting'>
                    {filteredTransactions.map((transaction: ITransaction) => 
                        <TransactionPreview key={transaction.id} transaction={transaction} />
                    )}
                </ul>

                <footer className='pagination'>
                    <button disabled={transactionsPageNumber <= 1} className='prev-button' onClick={getPrevTransactions}>&lt;</button>
                    <span className='page-number'>{transactionsPageNumber}</span>
                    <button className='next-button' onClick={getNextTransactions}>&gt;</button>
                </footer>
            </div>

            <TransactionPopup transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />

            <DeleteTransactionPopup
                transaction={selectedTransaction}
                isOpen={showDeletePopupDiv}
                onClose={() => setShowDeletePopupDiv(false)}
            />

        </>
    );
};

export default TransactionsPage;
