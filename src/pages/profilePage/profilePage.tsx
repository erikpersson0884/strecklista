import React from 'react';
import './ProfilePage.css';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) return null;
    return (
        <div className='profile-page page'>
            <div className='profile-header'>
                <div className='profile-image' style={{backgroundImage: `url(${currentUser?.icon})`}}></div>
                <div className='profile-name'>
                    <h1>{currentUser?.nick}</h1>
                    <hr />
                    <p>{currentUser.name}</p>
                </div>
            </div>

            <p>Saldo: {currentUser.balance} kr</p>

            <button className='client-page-navigation-button' onClick={() => navigate("/clients")}>Mina Klienter</button>

            <button className='logout-button' onClick={logout}>Logga ut</button>
        </div>
    );
};

export default ProfilePage;