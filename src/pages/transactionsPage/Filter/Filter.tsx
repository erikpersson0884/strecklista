
import React from 'react';
import './Filter.css';
import filterImage from '../../../assets/images/filter.svg';

import { useState, useEffect } from 'react';

import { useUsersContext } from '../../../contexts/UsersContext';
import { useTransactionsContext } from '../../../contexts/TransactionsContext';


const Filter: React.FC = () => {
    const { users } = useUsersContext();
    const { transactions, setFilteredTransactions } = useTransactionsContext();

    const [ selectedUserId, setselectedUserId ] = useState<string>('all');
    const [ startDate, setStartDate ] = useState<string | null>(null);
    const [ endDate, setEndDate ] = useState<string | null>(null);
    const [ showRemovedTransactions, setShowRemovedTransactions ] = useState<boolean>(false);

    const onUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setselectedUserId(e.target.value);
    };

    const onStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    };
    
    const onEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(e.target.value);
    };
    

    const onResetFilters = () => {
        setselectedUserId('all');
        setStartDate(null);
        setEndDate(null);
        setShowRemovedTransactions(false);
        setFilteredTransactions(transactions);
    };

    function isFinancialTransaction(transaction: ITransaction): transaction is FinancialTransaction {
        return transaction.type === 'purchase' || transaction.type === 'deposit';
    }

    useEffect(() => {
        let filteredTransactions = transactions;
        if (selectedUserId !== 'all') {
            const id = Number(selectedUserId);

            filteredTransactions = transactions.filter((transaction) => {
            if (isFinancialTransaction(transaction)) {
                return transaction.createdFor.id === id;
            } else {
                return transaction.createdBy.id === id;
            }
        })};
    
        if (startDate) {
            filteredTransactions = filteredTransactions.filter((transaction) => 
                transaction.createdTime >= new Date(startDate).getTime()
            );
        }
    
        if (endDate) {
            filteredTransactions = filteredTransactions.filter((transaction) => 
                transaction.createdTime <= new Date(endDate).getTime()
            );
        }

        if (!showRemovedTransactions) {
            filteredTransactions = filteredTransactions.filter((transaction: ITransaction) => 
                !transaction.removed
            );
        }
    
        setFilteredTransactions(filteredTransactions);
    }, [selectedUserId, startDate, endDate, showRemovedTransactions, transactions, setFilteredTransactions]); 
    


    const [ showFilter, setShowFilter ] = useState<boolean>(false);

    if (!showFilter) return (
        <button className='show-filter-button' onClick={() => setShowFilter(true)}>
            <p>Visa filter</p>
            <img src={filterImage} alt='filter' />
        </button>
    );

    else return (
        <div className='filter-div'>
                    <div>
                        <label htmlFor='user-filter'>Filter by user:</label>
                        <select
                            id='user-filter' 
                            onChange={onUserChange}
                        >
                            <option value={'all'}>Alla</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.nick}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor='start-date-filter'>Start date:</label>
                        <input type='date' id='start-date-filter' value={String(startDate)} onChange={onStartDateChange} />
                    </div>

                    <div>
                        <label htmlFor='end-date-filter'>End date:</label>
                        <input type='date' id='end-date-filter' value={endDate !== null ? String(endDate) : ''} onChange={onEndDateChange} />
                    </div>

                    <div>
                        <label htmlFor='show-deleted-transactions'>Visa strukna transaktioner:</label>
                        <input 
                            type='checkbox'
                            id='show-deleted-transactions'
                            checked={showRemovedTransactions}
                            onChange={() => setShowRemovedTransactions(!showRemovedTransactions)}
                        />
                    </div>
                            
                    <div>
                        <button onClick={onResetFilters}>
                            Återställ Filters
                        </button>
                        <button onClick={() => setShowFilter(false)}>
                            Stäng filter
                        </button>
                    </div>
                </div>
    )
};

export default Filter;
