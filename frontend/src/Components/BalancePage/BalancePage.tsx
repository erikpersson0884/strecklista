import React, { useState } from 'react';
import './BalancePage.css';

import { useUsersContext } from '../../Contexts/UsersContext';
import { User } from '../../Types';

import RefillPopup from './RefillPopup';

const BalancePage: React.FC = () => {
    const { users } = useUsersContext();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleOpenPopup = (user: User) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedUser(null);
    };

    return (
        <>
            {users.length > 0 ? (
                <div className='balancepage'>
                    {users.map(user => (
                        <UserDiv 
                            user={user} 
                            key={user.id}
                            onOpenPopup={handleOpenPopup}
                        />
                    ))}
                </div>
            ) : (
                <h1>No users found :(</h1>
            )}

            {selectedUser && (
                <RefillPopup 
                    user={selectedUser} 
                    showPopupDiv={showPopup} 
                    setShowPopupDiv={setShowPopup} 
                />
            )}
        </>
    );
};

interface UserDivProps {
    user: User;
    onOpenPopup: (user: User) => void;
}

const UserDiv: React.FC<UserDivProps> = ({ user, onOpenPopup }) => {
    return (
        <div className='user-div'>
            <img src='images/profile.svg' alt='profile' height={10} />
            <div className='name-div'>
                <h2>{user.nick}</h2>
                <hr />
                <h3>{user.name}</h3>
            </div>
            <p>{user.balance} kr</p>
            <button 
                className='add-button no-button-formatting' 
                onClick={() => onOpenPopup(user)}
            >
                <img src='/images/add.svg' alt='add' height={10} />
            </button>
        </div>
    );
}

export default BalancePage;
