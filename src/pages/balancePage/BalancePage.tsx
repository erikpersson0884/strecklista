import React from 'react';
import './BalancePage.css';

import useUsersContext from '@/contexts/UsersContext';
import useAuthContext from '@/contexts/AuthContext';
import useModalContext from '@/contexts/ModalContext';

import RefillPopup from '@/components/refillPopup/RefillPopup';
import addIcon from '@/assets/images/add.svg';


const BalancePage: React.FC = () => {
    const { currentUser } = useAuthContext();
    const { users, isLoadingUsers, getUserFromUserId } = useUsersContext();

    if (isLoadingUsers) return <p>Laddar användare...</p>

    else if (users.length === 0) return <p>Hittade inga användare</p>

    else return (
        <div className='balance-page page'>
            <ul className='page-list'>
                {currentUser &&
                    <UserBalance 
                        user={getUserFromUserId(currentUser.id)} 
                        key={currentUser.id}
                    />
                }

                {users.filter((user) => user.id !== currentUser?.id).map(user => (
                    <UserBalance 
                        user={user} 
                        key={user.id}
                    />
                ))}
            </ul>
        </div>
    );
};


interface UserBalanceProps {
    user: User;
}
const UserBalance: React.FC<UserBalanceProps> = ({ user }) => {
    const { openModal } = useModalContext()
    const { addUserBalance } = useUsersContext();

    const openRefillPopup = () => openModal(<RefillPopup item={user} refillAction={addUserBalance} currentBalance={user.balance} suffix='kr'/>)


    return (
        <li className='user-item list-item'>
            <div className='user-item-content'>
                <div className='name-div'>
                    <p >{user.nick}</p>
                    <p >{user.name}</p>
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
