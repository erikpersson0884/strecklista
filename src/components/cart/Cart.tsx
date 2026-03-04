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
    const { itemsInCart, buyProducts } = useCart();
    const { currentUser } = useAuth();
    if (!currentUser) return null; // Should never happen, but it can open before currentUser is set, so we need to handle this case

    const [comment, setComment] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User>(currentUser);
    const [includeComment, setIncludeComment] = useState<boolean>(false);

    const handleBuyProducts = async () => {
        if (itemsInCart.length === 0) return;
        if (comment.length > MAX_COMMENT_LENGTH) {
            alert(`Kommentaren får inte vara längre än ${MAX_COMMENT_LENGTH} tecken`);
            return;
        }
        const successfullBuy: boolean = await buyProducts(selectedUser.id, includeComment ? comment : undefined);
        if (successfullBuy) closeCart();
        else alert('Det gick inte att sträcka produkterna');
    };


    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <CartItems />
            <CartFooter selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
            
            <div>
                <CommentSection 
                    comment={comment} 
                    setComment={setComment}
                    includeComment={includeComment} 
                    setIncludeComment={setIncludeComment} 
                />

                <button className='pay-button' onClick={handleBuyProducts} disabled={itemsInCart.length === 0}>
                    Sträcka
                </button>
            </div>

        </div>
    );
};

const CartItems: FC = () => {
    const { itemsInCart } = useCart();

    return (
        <ul className='cart-list'>
            { itemsInCart.length === 0 && <p className='empty-cart-message'>Din korg är tom</p> }
            {itemsInCart.map((item) => (
                <CartItem key={item.id} item={item} />
            ))}
        </ul>
    )
};

interface CartFooterProps {
  selectedUser: User;
  setSelectedUser: React.Dispatch<React.SetStateAction<User>>;
}

const CartFooter: FC<CartFooterProps> = ({selectedUser, setSelectedUser}) => {
    const { users } = useUsersContext();
    const { total } = useCart();

    const handleSelectUserChangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const selectedUserId: string = e.target.value;
        const user: User | undefined = users.find(user => user.id === Number(selectedUserId));
        if (!user) throw new Error('Tried to set a user to pay that does not exist in users list');
        setSelectedUser(user);
    };

    return (
        <div className='cart-footer'>
            <p className='total'>
                <span>Totalt</span> 
                <span>{total.toLocaleString('sv-SE')} kr</span>
            </p>
            <hr />
            <div className='cart-footer'>
                <div className='select-paying-user'>
                    <label htmlFor="selectPayingUser">Sträcka åt</label>
                    <select 
                        id="selectPayingUser"
                        value={selectedUser.id}
                        onChange={handleSelectUserChangeChange}
                    >
                        {users.map((user: User) => (
                            <option key={user.id} value={user.id}>
                                {user.nick}
                            </option>
                        ))}
                    </select>
                </div>           
            </div>
        </div>
    );
};

interface CommentSectionProps {
    comment: string;
    setComment: React.Dispatch<React.SetStateAction<string>>;
    includeComment: boolean;
    setIncludeComment: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentSection: FC<CommentSectionProps> = ({comment, setComment, includeComment, setIncludeComment}) => {
    if (!includeComment) return (
        <button className='comment-button' onClick={() => setIncludeComment(true)}>
                <span>Lägg till kommentar</span>
        </button>
    )
    else return (
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
                onChange={(e) => setComment(e.target.value)}
                placeholder="Skriv en kommentar här..."
                maxLength={MAX_COMMENT_LENGTH}
            />
        </>
    )
}

export default Cart;
