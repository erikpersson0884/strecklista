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
    const { isLoadingTransactions } = useTransactionsContext();
    
    const [ showFilters, setShowFilters ] = useState<boolean>(false);

    if (isLoadingTransactions) return <p>Loading...</p>;
    else return (
        <div className='transactions-page page'>
            <SearchbarAndFilters showFilters={showFilters} setShowFilters={setShowFilters} />

            {showFilters && <Filter isVisible={showFilters} hideFilters={() => setShowFilters(false)}/>}
            <TransactionList />
            <Pagination />
        </div>
    );
};

const TransactionList = () => {
    const { filteredTransactions } = useTransactionsContext();
    if (filteredTransactions.length === 0) return (
        <p className='no-transactions'>Inga transaktioner hittades.</p>
    ) 
    else return (
        <ul className='transactions-list'>
            {filteredTransactions.map((transaction: ITransaction) => 
                <TransactionPreview key={transaction.id} transaction={transaction} />
            )}
        </ul>
    );
};

interface SearchbarAndFiltersProps {
    showFilters: boolean;
    setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
}
const SearchbarAndFilters: FC<SearchbarAndFiltersProps> = ({ showFilters, setShowFilters}) => {
    const { setFilters } = useTransactionsContext();

    return (
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
    )
};


const Pagination = () => {
    const { 
        filteredTransactions, 
        getNextTransactions, 
        getPrevTransactions,
        transactionsPageNumber,
    } = useTransactionsContext();
    return (
        <footer className='pagination'>
            <button disabled={transactionsPageNumber <= 1} className='prev-button' onClick={getPrevTransactions}>&lt;</button>
            <span className='page-number'>{transactionsPageNumber}</span>
            <button disabled={filteredTransactions.length == 0} className='next-button' onClick={getNextTransactions}>&gt;</button>
        </footer>
    );
};

interface TransactionPreviewProps {
    transaction: ITransaction;
}
const TransactionPreview: FC<TransactionPreviewProps> = ({transaction}) => {
    const { openModal } = useModalContext();

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
        <li 
            className={`transaction-preview list-item ${transaction.removed ? 'removed-transaction' : ''}`} 
            onClick={() => openModal(<TransactionPopup transaction={transaction}/>)}
        >
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
            <button className='open-popup-button'>
                <img src={downIcon} alt='Expandera' height={10}/>
            </button>
        </li>
    );
}

export default TransactionsPage;
