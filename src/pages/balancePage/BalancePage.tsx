import React from 'react';
import './BalancePage.css';

import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';

import UserBalance from './UserBalance';

const BalancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, isLoading: loadingUsers } = useUsersContext();


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
                />

                {users.filter((user) => user.id !== currentUser?.id).map(user => (
                    <UserBalance 
                        user={user} 
                        key={user.id}
                    />
                ))}
            </div>
        </>
    );
};

export default BalancePage;
