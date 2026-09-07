import { FC, useState, ChangeEvent, useEffect } from 'react';
import './Cart.css';

import { useCartContext } from '@/contexts/CartContext';
import { useUsersContext } from '@/contexts/UsersContext';
import useAuthContext from '@/contexts/AuthContext';
import useModalContext from '@/contexts/ModalContext';
import useNotificationContext from '@/contexts/NotificationContext';

import CartItem from './cartItem/CartItem';


const Cart: FC = () => {
    const { itemsInCart, purchaseCart } = useCartContext();
    const { currentUser } = useAuthContext();
    const { closeModal } = useModalContext();
    const { notify } = useNotificationContext();

    if (!currentUser) return null; // Should never happen, but it can open before currentUser is set, so we need to handle this case

    const [ comment, setComment ] = useState<string>('');
    const [ includeComment, setIncludeComment ] = useState<boolean>(false);

    const handleBuyProducts = async () => {
        const successfullBuy: boolean = await purchaseCart(includeComment ? comment : undefined);
        if (successfullBuy) closeModal();
        else notify('Kunde inte genomföra köpet. Försök igen senare.', 'error');
    };


    return (
        <div className='cart' onClick={(e) => e.stopPropagation()}>
            <CartItems />
            <CartFooter />
            
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
    const { itemsInCart } = useCartContext();

    return (
        <ul className='cart-list'>
            { itemsInCart.length === 0 && <p className='empty-cart-message'>Din korg är tom</p> }
            {itemsInCart.map((item) => (
                <CartItem key={item.id} item={item} />
            ))}
        </ul>
    )
};


const CartFooter: FC = () => {
    const { payingUser, setPayingUser } = useCartContext();
    const { currentUser } = useAuthContext();
    const { users, getUserFromUserId } = useUsersContext();
    const { total } = useCartContext();

    if (!currentUser) return null; // Should never happen, but it can open before currentUser is set, so we need to handle this case

    const handleSelectUserChangeChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const selectedUserId: string = e.target.value;
        setPayingUser(getUserFromUserId(selectedUserId));
    };

    useEffect(() => {
        if (currentUser && !payingUser) {
            setPayingUser(currentUser);
        }
    }, [currentUser, payingUser, setPayingUser]);


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
                        value={payingUser?.id || currentUser.id}
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
                maxLength={1000}
            />
        </>
    )
}

export default Cart;
