import React from 'react';
import './Filter.css';


import { useUsersContext } from '../../../contexts/UsersContext';
import { useTransactionsContext } from '../../../contexts/TransactionsContext';

interface FilterProps {
    isVisible: boolean;
    hideFilters: () => void;
}

const Filter: React.FC<FilterProps> = ({ isVisible, hideFilters }) => {
    const { resetFilters } = useTransactionsContext();

    if (!isVisible) return null;
    else return (
        <div className='filter-div'>
            <UserFilter />
            <TypeFilter />
            <StartDateFilter />
            <EndDateFilter />
            <DeletedTransactionFilter />
            
            <div>
                <button onClick={resetFilters}>
                    Återställ filter
                </button>

                <button onClick={hideFilters}>Stäng filter</button>
            </div>
        </div>
    )
};

const UserFilter = () => {
    const { filters, setFilters } = useTransactionsContext();
    const { users } = useUsersContext();

    return (
        <div>
            <label htmlFor='user-filter'>Användare:</label>
            <select
                id='user-filter' 
                onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
                value={String(filters.userId)}
            >
                <option value={'all'}>Alla</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.nick}
                    </option>
                ))}
            </select>
        </div>
    );
};

const TypeFilter = () => {
    const { filters, setFilters } = useTransactionsContext();

    const handleTransactionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value: TransactionType | 'all' = e.target.value as TransactionType | 'all';
        setFilters(f => ({ ...f, transactionType: value}));
    }
    
    return (
        <div>
            <label htmlFor='transaction-type-filter'>Transaktions-typ:</label>
            <select
                id='transaction-type-filter' 
                onChange={(e) => handleTransactionTypeChange(e)}
                value={filters.transactionType}
            >
                <option value={'all'}>Alla</option>
                <option value={'purchase'}>Köp</option>
                <option value={'deposit'}>Insättning</option>
                <option value={'stockUpdate'}>Lageruppdatering</option>
            </select>
        </div>
    )
}
    


const StartDateFilter = () => {
    const { filters, setFilters } = useTransactionsContext();
    return (
        <div>
            <label htmlFor='start-date-filter'>Från datum:</label>
            <input
                type='date'
                id='start-date-filter'
                value={filters.startDate ?? ''}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value || null }))}
            />
        </div>
    )
}
    

const EndDateFilter = () => {
    const { filters, setFilters } = useTransactionsContext();
    return (
        <div>
            <label htmlFor='end-date-filter'>Till datum:</label>
            <input
                type='date'
                id='end-date-filter'
                value={filters.endDate ?? ''}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value || null }))}
            />
        </div>
    )
}

const DeletedTransactionFilter = () => {
    const { filters, setFilters } = useTransactionsContext();
    return (
        <div>
            <label htmlFor='show-deleted-transactions'>Visa strukna transaktioner:</label>
            <input
                type='checkbox'
                id='show-deleted-transactions'
                checked={filters.showRemoved}
                onChange={() => setFilters(f => ({ ...f, showRemoved: !f.showRemoved }))}
            />
        </div>
    )
}

export default Filter;
