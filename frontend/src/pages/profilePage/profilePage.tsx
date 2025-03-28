import React from 'react';
import './profilePage.css';

import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
    // const { currentUser } = useUsersContext();
    const { currentUser } = useAuth();

    return (
        <div className='profile-page'>
            {currentUser ? (
            <div>
                <div className='profile-image' style={{backgroundImage: `url(${currentUser?.icon})`}}></div>
                <div className='profile-name'>
                    <h1>{currentUser?.nick}</h1>
                    <hr />
                    <p>{currentUser.name}</p>
                </div>

            </div>
            ) : (
                <h1>Not logged in</h1>
            )}

        </div>
    );
};

export default ProfilePage;