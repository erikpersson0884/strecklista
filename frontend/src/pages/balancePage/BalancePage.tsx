import React, { useState } from 'react';
import './BalancePage.css';

import addIcon from '../../assets/images/add.svg';

import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../Types';

import RefillPopup from './RefillPopup';

const BalancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { users } = useUsersContext();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleOpenPopup = (user: User) => {
        setSelectedUser(user);
        setShowPopup(true);
    };

    // const handleClosePopup = () => {
    //     setShowPopup(false);
    //     setSelectedUser(null);
    // };

    return (
        <>
            {users.length > 0 ? (
                <div className='balancepage'>

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
            ) : (
                <p>No users found :(</p>
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
            <div className='name-div'>
                <h2>{user.nick}</h2>
                <h3>{user.name}</h3>
            </div>
            <p>{user.balance} kr</p>
            
            <button 
                className='add-button no-button-formatting' 
                onClick={() => onOpenPopup(user)}
            >
                <img src={addIcon} alt='add' height={10} />
            </button>
        </div>
    );
}

export default BalancePage;
