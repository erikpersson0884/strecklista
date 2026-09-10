import type { FC } from 'react';
import { useState } from 'react';
import './TransactionsPage.css';

import useTransactionsContext from '@/contexts/TransactionsContext';
import useUsersContext from '@/contexts/UsersContext';
import useModalContext from '@/contexts/ModalContext';

import TransactionPopup from '@/components/transactionPopup/TransactionPopup';
import Filter from './Filter/Filter';

import downIcon from '@/assets/images/down.svg';
import filterIcon from '@/assets/images/filter.svg';
import shoppingCartIcon from '@/assets/images/shoppingcart.svg';
import stockIcon from '@/assets/images/stock-add.svg';
import walletIcon from '@/assets/images/wallet.svg';


const TransactionsPage: FC = () => {
    const { isLoadingTransactions } = useTransactionsContext();
    const { isLoadingUsers } = useUsersContext();

    const [ showFilters, setShowFilters ] = useState<boolean>(false);

    if (isLoadingTransactions) return <p>Loading transactions...</p>;
    else if (isLoadingUsers) return <p>Loading users...</p>;
    else return (
        <div className='transactions-page page'>
            <SearchbarAndFilters showFilters={showFilters} setShowFilters={setShowFilters} />

            <Filter isVisible={showFilters} hideFilters={() => setShowFilters(false)}/>
            <TransactionList />
            <Pagination />
        </div>
    );
};

function groupTransactionsByDate(transactions: ITransaction[]): [string, ITransaction[]][] {
    const groups = new Map<string, ITransaction[]>();

    for (const transaction of transactions) {
        const date = new Date(transaction.createdTime);
        const label = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });

        if (!groups.has(label)) groups.set(label, []);
        groups.get(label)!.push(transaction);
    }

    return Array.from(groups.entries());
}

const TransactionList = () => {
    const { filteredTransactions } = useTransactionsContext();
    if (filteredTransactions.length === 0) return <p className='no-transactions'>Inga transaktioner hittades.</p>

    const groups = groupTransactionsByDate(filteredTransactions);

    return (
        <div className='transaction-groups'>
            {groups.map(([dateLabel, transactions]) => (
                <div key={dateLabel} className='transaction-group'>
                    <p className='transaction-date-header'>{dateLabel}</p>
                    <ul className='page-list'>
                        {transactions.map((transaction: ITransaction) =>
                            <TransactionPreview key={transaction.id} transaction={transaction} />
                        )}
                    </ul>
                </div>
            ))}
        </div>
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
    const { getUserFromUserId } = useUsersContext();

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

    let username;
    if (transaction.type === 'purchase'  ||  transaction.type === 'deposit') {
        const userId = (transaction as Purchase | Deposit).createdFor;
        username = getUserFromUserId(userId).nick;
    } else if (transaction.createdBy.type === "user") {
        const userId = transaction.createdBy.id;
        username = getUserFromUserId(userId).nick;
    } else username = 'client id:' + transaction.createdBy.id;

    let icon;
    switch (transaction.type) {
        case 'purchase':
            icon = shoppingCartIcon;
            break;
        case 'deposit':
            icon = walletIcon;
            break;
        case 'stockUpdate':
            icon = stockIcon;
            break;
        default:
            icon = "?";
    }

    return (
        <li
            className={`transaction-preview list-item ${transaction.removed ? 'removed-transaction' : ''}`}
            onClick={() => openModal(<TransactionPopup transaction={transaction}/>)}
        >
            <div className={`transaction-icon transaction-icon-${transaction.type}`}>
                <img src={icon} alt='Transaktion' height={20}/>
            </div>

            <div className='transaction-info'>
                <p className='transaction-type'>{transactionTypeString}</p>
                <p className='transacton-user-and-time'>{username}</p>            
            </div>

            <div className='transaction-amount-and-chevron'>
            { transaction.type === 'purchase' && (
                <p className='transaction-amount transaction-amount-negative'>-{(transaction as Purchase).total} kr</p>
            )}
            
            { transaction.type === 'deposit' && (
                <p className='transaction-amount transaction-amount-positive'>+{(transaction as Deposit).total} kr</p>
            )}

            { transaction.type === 'stockUpdate' && (
                <p className='transaction-amount transaction-amount-neutral'>{(transaction as StockUpdate).items.length} st</p>
            )}

            <img className='chevron' src={downIcon} alt='' height={14}/>
            </div>
        </li>
    );
}

export default TransactionsPage;