import React from 'react';
import './PurchasesPage.css';

import Filter from './Filter/Filter';
import { usePurchasesContext } from '../../Contexts/PurchasesContext';
import { useUsersContext } from '../../Contexts/UsersContext';
import PurchaseItem from './PurchaseItem';

const ITEMS_PER_PAGE = 20;

const PurchasesPage: React.FC = () => {
    const { purchases } = usePurchasesContext();
    const { users } = useUsersContext();

    const [selectedUser, setSelectedUser] = React.useState<string>('all');
    const [startDate, setStartDate] = React.useState<string>('');
    const [endDate, setEndDate] = React.useState<string>('');
    const [currentPage, setCurrentPage] = React.useState<number>(1);

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(event.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const filteredPurchases = purchases.filter(purchase => {
        const userMatch = selectedUser === 'all' || purchase.buyingUser.id === selectedUser;
        const dateMatch = (!startDate || new Date(purchase.date) >= new Date(startDate)) &&
                          (!endDate || new Date(purchase.date) <= new Date(endDate));
        return userMatch && dateMatch;
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const [ showFilter, setShowFilter ] = React.useState<boolean>(false);

    return (
        <>  
            {
                showFilter ? (
                    <Filter 
                    users={users} 
                    selectedUser={selectedUser} 
                    onUserChange={handleUserChange} 
                    startDate={startDate}
                    onStartDateChange={handleStartDateChange}
                    endDate={endDate}
                    onEndDateChange={handleEndDateChange}
                    onResetFilters={() => { setSelectedUser('all'); setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                    hideFilter={() => setShowFilter(false)}
                />
                ) : (
                    <button className='show-filter-button' onClick={() => setShowFilter(true)}>
                        Filtrera
                        <img src='images/filter.svg' alt='filter' />
                    </button>
                )
            }


            <ul className='purchases-list'>
                {paginatedPurchases.map((purchase) => (
                    <PurchaseItem key={purchase.id} purchase={purchase} />
                ))}
            </ul>

            <div className='pagination'>
                {currentPage !== 1 && (
                    <button onClick={handlePreviousPage} disabled={false}>
                        &lt;
                    </button>
                )}

                <span>{currentPage}</span>

                {endIndex < filteredPurchases.length && (
                    <button onClick={handleNextPage} disabled={endIndex >= filteredPurchases.length}>
                        &gt;
                    </button>
                )}
            </div>
        </>
    );
};


export default PurchasesPage;
