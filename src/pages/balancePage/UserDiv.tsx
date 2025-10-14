import React from 'react';
import addIcon from '../../assets/images/add.svg';

interface UserDivProps {
    user: User;
    onOpenPopup: (user: User) => void;
}

const UserDiv: React.FC<UserDivProps> = ({ user, onOpenPopup }) => {
    return (
        <div className='user-div'>
            <div className='user-div-content'>
                <div className='name-div'>
                    <p>{user.nick}</p>
                    <p>{user.name}</p>
                </div>
                <p className={`user-balance ${user.balance < 0 ? 'negative-balance' : 'positive-balance'}`}>
                    {user.balance.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr
                </p>
            </div>
            
            <button 
                className='open-refill-popup-button' 
                onClick={() => onOpenPopup(user)}
            >
                <img src={addIcon} alt='add' height={10} />
            </button>
        </div>
    );
}

export default UserDiv;
