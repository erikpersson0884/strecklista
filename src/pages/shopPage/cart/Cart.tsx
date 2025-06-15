import React from 'react';
import './Cart.css';
import { useCart } from '../../../contexts/CartContext';
import { useUsersContext } from '../../../contexts/UsersContext';
import { useAuth } from '../../../contexts/AuthContext';
import CartItem from './cartItem/CartItem';
import closeImage from '../../../assets/images/close.svg';

interface CartProps {
    closeCart: () => void;       
}

const Cart: React.FC<CartProps> = ({ closeCart }) => {
    const { items, buyProducts, total } = useCart();
    const { users } = useUsersContext();
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    const [comment, setComment] = React.useState<string>('');
    const [selectedUser, setSelectedUser] = React.useState<User>(currentUser);
    const [showOverpayButton, setShowOverpayButton] = React.useState<boolean>(false);

    const handleBuyProducts = async () => {
        if (selectedUser.balance < total && !showOverpayButton) {
            setShowOverpayButton(true);
            return;
        }
        const successfullBuy: boolean = await buyProducts(selectedUser.id, comment);
        if (successfullBuy) closeCart();
        else alert('Det gick inte att sträcka produkterna');
    };

    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <h2>Varukorg:</h2>

            <button className='close-button' onClick={closeCart}>
                <img src={closeImage} alt="close" height={20}/>
            </button>

            <hr />

            {items.length === 0 ? 
                <p>Varukorgen är tom</p> 
            : 
                <>
                    <ul className='cart-list'>
                        {items.map((item) => (
                            <CartItem key={item.id} product={item} />
                        ))}

                        <li className='total cart-item'>
                        <span>Totalt</span> 
                        <span>{total} kr</span>
                        </li>
                    </ul>

                    <hr />

                    <CartFooter
                        comment={comment}
                        setComment={setComment}
                        closeCart={closeCart}
                        users={users}
                        selectedUser={selectedUser}
                        setSelectedUser={setSelectedUser}
                    />

                    <button className='pay-button' onClick={showOverpayButton ? () => {} : handleBuyProducts}>Strecka</button>

                    {showOverpayButton && <button onClick={handleBuyProducts} className='cancel-button'>Godkänn överbetalning</button>}

                </>
            }
        </div>
    );
};

interface CartFooterProps {
    setComment: React.Dispatch<React.SetStateAction<string>>;
    comment: string;
    closeCart: () => void;
    users: User[];
    selectedUser: User | null;
    setSelectedUser: React.Dispatch<React.SetStateAction<User>>;
}

const CartFooter: React.FC<CartFooterProps> = ({
    setComment,
    comment,
    users,
    selectedUser,
    setSelectedUser,
}) => {
    const [showCommentInput, setShowCommentInput] = React.useState(false);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const selectedUserId: string = e.target.value;
        const user = users.find(user => user.id === Number(selectedUserId));
        if (!user) throw new Error('Tried to set user that does not exist in cart list');
        setSelectedUser(user);
    };

    return (
        <div className='cart-footer'>
            <div className='select-paying-user'>
                <p>Sträcka åt</p>
                <select 
                    name="users" 
                    id="users" 
                    value={selectedUser?.id || ''} 
                    onChange={handleSelectChange}
                >
                    {users.map((user: User) => (
                        <option 
                            key={user.id} 
                            value={user.id}
                        >
                            {user.nick}
                        </option>
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
    );
};

export default Cart;
