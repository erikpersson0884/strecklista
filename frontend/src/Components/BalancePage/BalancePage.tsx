import React from 'react';
import './BalancePage.css';

import { useUsersContext } from '../../Contexts/UsersContext';
import { User } from '../../Types';


const BalancePage: React.FC = () => {
    const { users } = useUsersContext();
    
    return (
        <div className='balancepage'>
            {(users.length > 0) ?
                <>

                    {users.map(user => (
                        <UserDiv user={user} key={user.id}/>
                    ))}
                </>
                :
                <h1>No users found :(</h1>

            }
        </div>
    );
};


interface userDiv {
    user: User;
}

const UserDiv: React.FC<userDiv> = ({user}) => {
    return (
        // <div className='user-div-container'>
            <div className='user-div'>
                <img src='images/profile.svg' alt='profile' height={10}/>

                <div className='name-div'>
                    <h2>{user.nick}</h2>
                    <hr />
                    <h3>{user.name}</h3>
                </div>

                <p>{user.balance} kr</p>

                <button className='add-button no-button-formatting'>
                    <img src='/images/add.svg' alt='add' height={10} />
                </button>
            </div>
        // </div>

    );
}


export default BalancePage;