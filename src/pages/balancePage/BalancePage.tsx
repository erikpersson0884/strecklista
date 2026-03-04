import React from 'react';
import './BalancePage.css';

import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import { useModalContext } from '../../contexts/ModalContext';

import RefillUserBalancePopup from '../../components/refillUserBalancePopup/RefillUserBalancePopup';
import addIcon from '../../assets/images/add.svg';


const BalancePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, isLoadingUsers, getUserFromUserId } = useUsersContext();

    if (isLoadingUsers || !currentUser) return ( // should implement a better check for current user
        <p>Laddar användare...</p>
    )
    else if (users.length === 0) return <p>Hittade inga användare</p>
    else return (
            <div className='balancepage list-page page'>

                <UserBalance 
                    user={getUserFromUserId(currentUser.id)} 
                    key={currentUser.id}
                />

                {users.filter((user) => user.id !== currentUser?.id).map(user => (
                    <UserBalance 
                        user={user} 
                        key={user.id}
                    />
                ))}
            </div>
    );
};


interface UserBalanceProps {
    user: User;
}
const UserBalance: React.FC<UserBalanceProps> = ({ user }) => {
    const { openModal } = useModalContext()

    const openRefillPopup = () => {
        openModal(<RefillUserBalancePopup user={user}/>)
    }


    return (
        <li className='user-div list-item'>
            <div className='user-div-content'>
                <div className='name-div'>
                    <p className='list-item__primary'>{user.nick}</p>
                    <p className='list-item__secondary'>{user.name}</p>
                </div>
                <p className={`user-balance`}>
                    {user.balance.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                </p>
            </div>
            
            <button 
                className='open-popup-button' 
                onClick={openRefillPopup}
            >
                <img src={addIcon} alt='add' height={10} />
            </button>
        </li>
    );
}


export default BalancePage;
