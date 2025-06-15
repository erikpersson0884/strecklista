import React, { useState } from 'react';
import './BalancePage.css';

import UserDiv from './UserDiv';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';

import RefillPopup from './RefillPopup';

const BalancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, isLoading: loadingUsers } = useUsersContext();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleOpenPopup = (user: User) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    if (loadingUsers) return (
        <p>Laddar användare...</p>
    )

    if (users.length > 0) return (
        <>
            <div className='balancepage page'>

            {currentUser && (
                    <>
                        <UserDiv 
                            user={users.find((user) => user.id === currentUser.id) as User} 
                            key={currentUser.id}
                            onOpenPopup={handleOpenPopup}
                        />

                        <hr />
                    </>
                )}

                {users.filter((user) => user.id !== currentUser?.id).map(user => (
                    <UserDiv 
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

    return (<p>Hittade inga användare</p>);
};

export default BalancePage;
