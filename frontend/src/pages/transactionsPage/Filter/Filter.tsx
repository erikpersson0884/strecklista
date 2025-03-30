
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
        setFilteredTransactions(transactions);
    };

    useEffect(() => {
        let filteredTransactions = transactions;

        if (selectedUserId != 'all') {
            filteredTransactions = filteredTransactions.filter((transaction) => transaction.createdFor.id === selectedUserId);
        }
    
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
    
        setFilteredTransactions(filteredTransactions);
    }, [selectedUserId, startDate, endDate, transactions, setFilteredTransactions]); 
    


    const [ showFilter, setShowFilter ] = useState<boolean>(false);


    return showFilter ? (
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
                        <button onClick={onResetFilters}>
                            Återställ Filters
                        </button>
                        <button onClick={() => setShowFilter(false)}>
                            Stäng filter
                        </button>
                    </div>
                </div>
    ) : (
        <button className='show-filter-button' onClick={() => setShowFilter(true)}>
            <p>Visa filter</p>
            <img src={filterImage} alt='filter' />
        </button>
    );
};

export default Filter;
