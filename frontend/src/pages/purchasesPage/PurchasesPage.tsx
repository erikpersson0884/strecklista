import React, { useState, useEffect } from 'react';
import './PurchasesPage.css';

import filterIcon from '../../assets/images/filter.svg';
import Filter from './Filter/Filter';
import PurchaseItem from './PurchaseItem';
import { getGroupPurchases } from '../../api/purchasesApi';
import { useUsersContext } from '../../contexts/UsersContext';

import { Purchase } from '../../Types';

const ITEMS_PER_PAGE = 20;

const PurchasesPage: React.FC = () => {
    const { users } = useUsersContext();

    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchPurchases();
    }, [currentPage, selectedUser, startDate, endDate]);


    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const offset = (currentPage - 1) * ITEMS_PER_PAGE;
            const data = await getGroupPurchases(ITEMS_PER_PAGE, offset);

            setPurchases(data.purchases);
            setNextUrl(data.next || null);
            setPrevUrl(data.previous || null);

        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Purchases changed:', purchases);
    }, [purchases]);

    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUser(event.target.value);
        setCurrentPage(1);
    };

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
        setCurrentPage(1);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
        setCurrentPage(1);
    };

    const handlePreviousPage = () => {
        if (prevUrl) setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        if (nextUrl) setCurrentPage((prev) => prev + 1);
    };

    const [showFilter, setShowFilter] = useState<boolean>(false);

    return (
        <>
            {showFilter ? (
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
                    <img src={filterIcon} alt='filter' />
                </button>
            )}

            {loading ? <p>Loading...</p> : (
                <ul className='purchases-list'>
                    {purchases.map((purchase: Purchase) => (
                        <PurchaseItem key={purchase.id} purchase={purchase} />
                    ))}
                </ul>
            )}

            <button onClick={() => console.log(purchases)}>Log purchases</button>

            <div className='pagination'>
                {prevUrl && (
                    <button onClick={handlePreviousPage}>&lt;</button>
                )}
                <span>{currentPage}</span>
                {nextUrl && (
                    <button onClick={handleNextPage}>&gt;</button>
                )}
            </div>
        </>
    );
};

export default PurchasesPage;
