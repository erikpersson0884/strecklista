import React from 'react';
import './Cart.css';
import { useCart } from '../../../contexts/CartContext';
import { useUsersContext } from '../../../contexts/UsersContext';
import { User } from '../../../Types';
import { useAuth } from '../../../contexts/AuthContext';

import deleteIcon from '../../../assets/images/delete-white.svg';

interface CartProps {
    closeCart: () => void;       
}

const Cart: React.FC<CartProps> = ({ closeCart }) => {
    const { items, removeItem } = useCart();
    const { buyProducts, total } = useCart();
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

    const [showCommentInput, setShowCommentInput] = React.useState(false);
    const [ comment, setComment ] = React.useState('');

    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <h2>Varukorg:</h2>

            <hr />

            {items.length === 0 ? 
                <p>Varukorgen är tom</p> 
            : 
            <>
                <ul className='cartList'>
                    {items.map((item, index) => (
                        <li key={index}>
                            <span className='item-name'>{item.name}</span>

                            {/* <button className='add-button' onClick={() => addProduct(item)}>+</button> */}
                            <span>{item.amount}st</span>
                            {/* <button className='' onClick={() => decreaseProductAmount(item)}>-</button> */}

                            <span className='item-price'>{item.amount * item.price}kr</span>
                            <button className='delete-button' onClick={() => removeItem(item)}>
                                <img src={deleteIcon} alt="delete" height={10}/>
                            </button>
                        </li>
                    ))}

                    <li className='total'>
                       <span>Totalt</span> 
                       <span>{total} kr</span>
                    </li>
                </ul>

                <hr />

                <div className='cart-footer'>
                    <div className='select-paying-user'>
                        <p>Sträcka åt</p>
                        <select name="users" id="users" value={selectedUser?.id || ''} onChange={handleSelectChange}>
                            {users.map((user: User) => (
                                <option key={user.id} value={user.id}>{user.nick}</option>
                            ))}
                        </select>

                        <button
                            onClick={() => setShowCommentInput(!showCommentInput)}
                            className='open-comment-button'
                        >
                            Kommentar
                        </button>
                    </div>
                    
                    {showCommentInput && (
                        <input
                            type='text'
                            placeholder='Kommentar'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />    
                    )}                
                </div>

                <button className='' onClick={handleBuyProducts}>Strecka</button>
            </>}
        </div>
    );
};

export default Cart;