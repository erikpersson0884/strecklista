import addIcon from '../../assets/images/add.svg';

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
            <p className={user.balance < 0 ? 'negative-balance' : 'positive-balance'}>
                {user.balance} kr
            </p>
            
            <button 
                className='add-button no-button-formatting' 
                onClick={() => onOpenPopup(user)}
            >
                <img src={addIcon} alt='add' height={10} />
            </button>
        </div>
    );
}

export default UserDiv;
