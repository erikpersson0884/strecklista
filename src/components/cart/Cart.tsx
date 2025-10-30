import { FC, useState, ChangeEvent } from 'react';
import './Cart.css';

import { useCart } from '../../contexts/CartContext';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';

import CartItem from './cartItem/CartItem';

interface CartProps {
    closeCart: () => void;       
}

const Cart: FC<CartProps> = ({ closeCart }) => {
    const { itemsInCart, buyProducts, total } = useCart();
    const { users } = useUsersContext();
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    const [comment, setComment] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User>(currentUser);
    const [showCommentInput, setShowCommentInput] = useState(false);


    const handleBuyProducts = async () => {
        if (itemsInCart.length === 0) return;
        const successfullBuy: boolean = await buyProducts(selectedUser.id, comment);
        if (successfullBuy) closeCart();
        else alert('Det gick inte att sträcka produkterna');
    };

    const CartFooter: FC = () => {

        const handleSelectUserChangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
            const selectedUserId: string = e.target.value;
            const user: User | undefined = users.find(user => user.id === Number(selectedUserId));
            if (!user) throw new Error('Tried to set user that does not exist in cart list');
            setSelectedUser(user);
        };

        return (
            <div className='cart-footer'>
                <div className='total'>
                    <span>Totalt</span> 
                    <span>{total} kr</span>
                </div>
                <hr />
                <div className='cart-footer'>
                    <div className='select-paying-user'>
                        <p>Sträcka åt</p>
                        <select 
                            name="users"
                            id="users"
                            value={selectedUser?.id || ''}
                            onChange={handleSelectUserChangeChange}
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
                    </div>           
                </div>
            </div>
        );
    };

    const CommentSection: FC = () => (
        <>
            <button
                onClick={() => setShowCommentInput(!showCommentInput)}
                className='open-comment-button'
            >
                Kommentar
            </button>

            {showCommentInput && (
                <input
                    type='text'
                    placeholder='Kommentar'
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />
            )}    
        </>
    );


    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <ul className='cart-list'>
                {itemsInCart.map((item) => (
                    <CartItem key={item.id} item={item} />
                ))}
            </ul>

            <CartFooter />

            <div>
                <CommentSection />

                <button className='pay-button' onClick={handleBuyProducts} disabled={itemsInCart.length === 0}>
                    Sträcka
                </button>
            </div>

        </div>
    );
};

export default Cart;
