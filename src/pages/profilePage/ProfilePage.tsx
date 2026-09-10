import React from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';

import useAuthContext from '@/contexts/AuthContext';

import Icon from '@/components/icon/Icon';
import backUpIcon from '@/assets/images/profile.svg';

const ProfilePageHeader = ({
    title,
    subtitle,
    imageUrl = backUpIcon,
}: {
    title?: string;
    subtitle: string;
    imageUrl?: string | null;
}) => {
    return (
        <div className='profile-header'>
            {/* <div className='profile-image' style={{ backgroundImage: `url(${imageUrl ?? backUpIcon})` }}></div> */}
            <Icon src={imageUrl ?? backUpIcon} className='profile-image' alt='Profile image' />
            <div className='profile-name'>
                <h1>{title}</h1>
                <hr />
                <p>{subtitle}</p>
            </div>
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const { currentUser, currentClient, logout } = useAuthContext();
    const navigate = useNavigate();

    return (
        <div className='profile-page page'>
            <ProfilePageHeader
                title={currentUser ? currentUser.nick : currentClient ? currentClient.displayName : ''}
                subtitle={currentUser ? currentUser.name : currentClient ? "Klient" : ''}
                imageUrl={currentUser ? currentUser.icon : currentClient ? currentClient.group?.avatarUrl : undefined}
            />

            {currentUser &&
                <>
                    <p>Saldo: {currentUser.balance} kr</p>
                    <button className='client-page-navigation-button' onClick={() => navigate("/clients")}>Mina Klienter</button>
                </>
            }
            <button className='client-page-navigation-button' onClick={() => navigate("/style")}>Styling</button>


            <button className='logout-button' onClick={logout}>Logga ut</button>
        </div>
    );
};

export default ProfilePage;
