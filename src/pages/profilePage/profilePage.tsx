import React from 'react';
import './profilePage.css';

import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    const { currentUser, logout } = useAuth();

    return (
        <div className='profile-page page'>
            {currentUser ? (
            <>
                <div>
                    <div className='profile-image' style={{backgroundImage: `url(${currentUser?.icon})`}}></div>
                    <div className='profile-name'>
                        <h1>{currentUser?.nick}</h1>
                        <hr />
                        <p>{currentUser.name}</p>
                    </div>
                </div>

                <p>Saldo: {currentUser.balance} kr</p>

                <button className='logout-button' onClick={logout}>Logga ut</button>
            </>
            ) : (
                <h1>Not logged in</h1>
            )}

        </div>
    );
};

export default ProfilePage;