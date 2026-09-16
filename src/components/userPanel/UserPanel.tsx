import React from 'react'
import './UserPanel.css'
import useCartContext from '@/contexts/CartContext'
import useUserContext from '@/contexts/UsersContext'
import Barcode from "react-barcode";

interface UserListItemProps {
    user: User;
}
const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
    const { setPayingUser } = useCartContext();

    const title = user.externalId ? `Välj ${user.nick} som betalande användare` : `Välj ${user.nick} som betalande användare \n(OBS: saknar externt id)`;
    return (
        <li className='user-item' key={user.id} onClick={() => setPayingUser(user)} title={title}>
            <Barcode
                value={user.externalId || user.id || "missing externalId"}
                format="CODE128"
                className="barcode"
                text={user.nick}
                height={40}
            />
        </li>
    )
}

const UserPanel: React.FC = () => {
    const { users } = useUserContext();

    return (
        <div className='user-panel-container'>
            <p className='section-label'>STRÄCKA PÅ VEM?</p>
            <ul className='user-panel panel'>
                {users.filter(user => (user)).map(user => (
                    <UserListItem key={user.id} user={user} />
                ))}
            </ul>
        </div>
    )
}

export default UserPanel;
