import React from 'react';
import './Cart.css';
import { useCart } from '../../../Contexts/CartContext';
import { useUsersContext } from '../../../Contexts/UsersContext';
import { User } from '../../../Types';
import { useAuth } from '../../../Contexts/AuthContext';

interface CartProps {
    closeCart: () => void;       
}

const Cart: React.FC<CartProps> = ({ closeCart }) => {
    const { items, removeItem } = useCart();
    const { buyProducts } = useCart();
    const { users } = useUsersContext();
    const { currentUser } = useAuth();

    const [ selectedUser, setSelectedUser ] = React.useState<User | null>(currentUser);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = e.target.value;
        const selectedUser = users.find(user => user.id === selectedUserId);
        setSelectedUser(selectedUser || null);
    }

    const handleBuyProducts = () => {
        if (!selectedUser) throw new Error('No user selected');
        else {
            const successfullBuy: boolean = buyProducts(selectedUser.id);

            if (successfullBuy) {
                closeCart();
            } else {
                alert('Det gick inte att sträcka produkterna');
            }
        }
    }

    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <h2>Varukorg:</h2>

            <hr />
            
            <ul className='cartList'>
                {items.map((item, index) => (
                    <li key={index}>
                        <span>{item.name}</span>
                        <span>{item.amount}st</span>
                        <span>{item.amount * item.price}kr</span>
                        <button className='delete-button' onClick={() => removeItem(item)}>
                            <img src="images/delete.svg" alt="delete" height={10}/>
                        </button>
                    </li>
                ))}
            </ul>

            <div className='select-paying-user'>
                <p>Sträcka åt</p>
                <select name="users" id="users" value={selectedUser?.id || ''} onChange={handleSelectChange}>
                    {users.map((user: User) => (
                        <option key={user.id} value={user.id}>{user.nick}</option>
                    ))}
                </select>
            </div>


            
            {items.length === 0 ? <p>Varukorgen är tom</p> : 
                <button className='' onClick={handleBuyProducts}>Strecka</button>
            }

        </div>
    );
};

export default Cart;