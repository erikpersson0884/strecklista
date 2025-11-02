import type { FC } from 'react';
import { useState } from 'react';
import './TransactionsPage.css';

import { useTransactionsContext } from '../../contexts/TransactionsContext';
import { useModalContext } from '../../contexts/ModalContext';

import TransactionPopup from '../../components/transactionPopup/TransactionPopup';
import Filter from './Filter/Filter';

import downIcon from '../../assets/images/down.svg';
import filterIcon from '../../assets/images/filter.svg';

const TransactionsPage: FC = () => {
    const { 
        isLoading,
        filteredTransactions, 
        getNextTransactions, 
        getPrevTransactions,
        transactionsPageNumber,
        setFilters
    } = useTransactionsContext();
    const { openModal } = useModalContext();
    

    if (isLoading) return <p>Loading...</p>;

    const [ showFilters, setShowFilters ] = useState<boolean>(false);

    const openTransactionPopup = (transaction: ITransaction) => {
        openModal(<TransactionPopup transaction={transaction}/>);
    };



    interface TransactionPreviewProps {
        transaction: ITransaction;
    }

    const TransactionPreview: FC<TransactionPreviewProps> = ({transaction}) => {
        let transactionTypeString: string;
        switch (transaction.type) {
            case 'purchase': 
                transactionTypeString = 'Köp';
                break;
            case 'deposit':
                transactionTypeString = 'Insättning';
                break;
            case 'stockUpdate':
                transactionTypeString = 'Lageruppdatering';
                break;
            default:
                transactionTypeString = 'Okänd';
        }

        let username: string;
        if (transaction.type === 'purchase'  ||  transaction.type === 'deposit') username = (transaction as Purchase | Deposit).createdFor.nick;
        else username = transaction.createdBy.nick;

        return (
            <li className={`transaction-preview list-item ${transaction.removed ? 'removed-transaction' : ''}`}>
                <div className='transaction-preview-content'>
                    <div className='list-item__primary'>
                        <p>{new Date(transaction.createdTime).toISOString().split('T')[0]}</p>
                        <p>{username}</p>
                    </div>
                    <div className='list-item__secondary'>
                        <p>{transactionTypeString}</p>
                        { transaction.type === 'purchase' && ( 
                            <p>{(transaction as Purchase).total}kr</p>
                        )} 
                    </div>
                </div>
                <button className='open-popup-button' onClick={() => openTransactionPopup(transaction)}>
                    <img src={downIcon} alt='Expandera' height={10}/>
                </button>
            </li>
        );
    }

    return (
        <>
            <div className='transactions-page page'>
                <div className='search-and-filter'>
                    <input 
                        type='text' 
                        placeholder='Sök transaktioner...' 
                        className='search-bar' 
                        onChange={(e) =>
                            setFilters(f => ({ ...f, searchQuery: e.target.value }))
                        }
                    />
                    <button 
                        className='open-filters-button' 
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <img src={filterIcon} alt='Filter' height={10}/>
                    </button>
                </div>

                {showFilters && <Filter />}
                

                <ul className='transactions-list'>

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

        </>
    );
};

export default TransactionsPage;
