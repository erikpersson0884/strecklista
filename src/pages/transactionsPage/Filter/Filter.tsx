import React from 'react';
import './Filter.css';


import { useUsersContext } from '../../../contexts/UsersContext';
import { useTransactionsContext } from '../../../contexts/TransactionsContext';


const Filter: React.FC = () => {
    const { users } = useUsersContext();
    const { filters, setFilters, resetFilters } = useTransactionsContext();

    return (
        <div className='filter-div'>
                    <div>
                        <label htmlFor='user-filter'>Filter by user:</label>
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

                    <div>
                        <label htmlFor='start-date-filter'>Start date:</label>
                        <input
                            type='date'
                            id='start-date-filter'
                            value={filters.startDate ?? ''}
                            onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value || null }))}
                        />
                    </div>

                    <div>
                        <label htmlFor='end-date-filter'>End date:</label>
                        <input
                            type='date'
                            id='end-date-filter'
                            value={filters.endDate ?? ''}
                            onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value || null }))}
                        />
                    </div>

                    <div>
                        <label htmlFor='show-deleted-transactions'>Visa strukna transaktioner:</label>
                        <input
                            type='checkbox'
                            id='show-deleted-transactions'
                            checked={filters.showRemoved}
                            onChange={() => setFilters(f => ({ ...f, showRemoved: !f.showRemoved }))}
                        />
                    </div>
                            
                    <button onClick={resetFilters}>
                        Återställ filter
                    </button>
                </div>
    )
};

export default Filter;
