import React from 'react';
import addIcon from '../../assets/images/add.svg';

interface UserBalanceProps {
    user: User;
    onOpenPopup: (user: User) => void;
}

const UserBalance: React.FC<UserBalanceProps> = ({ user, onOpenPopup }) => {
    return (
        <li className='user-div list-item'>
            <div className='user-div-content'>
                <div className='name-div'>
                    <p className='list-item__primary'>{user.nick}</p>
                    <p className='list-item__secondary'>{user.name}</p>
                </div>
                <p className={`user-balance ${user.balance < 0 ? 'negative-balance' : 'positive-balance'}`}>
                    {user.balance.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                </p>
            </div>
            
            <button 
                className='open-popup-button' 
                onClick={() => onOpenPopup(user)}
            >
                <img src={addIcon} alt='add' height={10} />
            </button>
        </li>
    );
}

export default UserBalance;
