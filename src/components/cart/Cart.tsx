import { FC, useState, ChangeEvent } from 'react';
import './Cart.css';

import { useCart } from '../../contexts/CartContext';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';

import CartItem from './cartItem/CartItem';

const MAX_COMMENT_LENGTH = 1000;

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
    const [includeComment, setIncludeComment] = useState<boolean>(false);

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newComment: string = e.target.value;
        if (!validateComment(newComment)) return;
        setComment(newComment);
    }

    const validateComment = (comment: string) => {
        if (comment.length > MAX_COMMENT_LENGTH) {
            return false;
        }
        return true;
    };

    const handleBuyProducts = async () => {
        if (itemsInCart.length === 0) return;
        const successfullBuy: boolean = await buyProducts(selectedUser.id, includeComment ? comment : undefined);
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
                <footer className='cart-footer'>
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
                </footer>
            </div>
        );
    };

    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <ul className='cart-list'>
                {itemsInCart.map((item) => (
                    <CartItem key={item.id} item={item} />
                ))}
            </ul>

            <CartFooter />

            
            <div>
                {
                    includeComment ? (
                        <>
                            <hr />
                            <div className='comment-header'>
                                <label htmlFor="comment">Kommentar (valfritt): </label>
                                <button onClick={() => { setIncludeComment(false); }}>Ingen Kommentar</button>
                            </div>
                            <textarea
                                id="comment"
                                className='comment'
                                value={comment}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleCommentChange(e)}
                                placeholder="Skriv en kommentar här..."
                            />
                        </>
                    ) : (
                        <button className='comment-button' onClick={() => setIncludeComment(true)}>
                            <span>Lägg till kommentar</span>
                        </button>
                    )
                }

                <button className='pay-button' onClick={handleBuyProducts} disabled={itemsInCart.length === 0}>
                    Sträcka
                </button>
            </div>

        </div>
    );
};

export default Cart;
