import React, { useState } from 'react';
import './BalancePage.css';

import UserBalance from './UserBalance';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';

import RefillPopup from '../../components/refillUserBalancePopup/RefillUserBalancePopup';

const BalancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, isLoading: loadingUsers } = useUsersContext();
    const [ selectedUser, setSelectedUser ] = useState<User | null>(null);
    const [ showPopup, setShowPopup ] = useState(false);

    const handleOpenPopup = (user: User) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    if (loadingUsers || !currentUser) return ( // should implement a better check for current user
        <p>Laddar användare...</p>
    )

    else if (users.length === 0) return <p>Hittade inga användare</p>

    else return (
        <>
            <div className='balancepage list-page page'>

                <UserBalance 
                    user={currentUser} 
                    key={currentUser.id}
                    onOpenPopup={handleOpenPopup}
                />

                {users.filter((user) => user.id !== currentUser?.id).map(user => (
                    <UserBalance 
                        user={user} 
                        key={user.id}
                        onOpenPopup={handleOpenPopup}
                    />
                ))}
            </div>

            {selectedUser && (
                <RefillPopup 
                    user={selectedUser} 
                    isOpen={showPopup}
                    onClose={() => setShowPopup(false)}
                />
            )}
        </>
    );
};

export default BalancePage;
