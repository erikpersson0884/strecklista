
import React from 'react';
import { User } from '../../../Types';
import './Filter.css';

interface FilterProps {
    users: User[];
    selectedUser: string;
    startDate: string;
    endDate: string;
    onUserChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onStartDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onEndDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onResetFilters: () => void;
    hideFilter: () => void;
}

const Filter: React.FC<FilterProps> = ({ users, selectedUser, startDate, endDate, onUserChange, onStartDateChange, onEndDateChange, onResetFilters, hideFilter }) => {

    return (
        <div className='filter-div'>
            <div>
                <label htmlFor='user-filter'>Filter by user:</label>
                <select id='user-filter' value={selectedUser} onChange={onUserChange}>
                    <option value='all'>All</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.nick}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor='start-date-filter'>Start date:</label>
                <input type='date' id='start-date-filter' value={startDate} onChange={onStartDateChange} />
            </div>

            <div>
                <label htmlFor='end-date-filter'>End date:</label>
                <input type='date' id='end-date-filter' value={endDate} onChange={onEndDateChange} />
            </div>
                    
            <div>
                <button onClick={onResetFilters}>
                    Återställ Filters
                </button>
                <button onClick={hideFilter}>
                    Stäng filter
                </button>
            </div>

        </div>
    );
};

export default Filter;
