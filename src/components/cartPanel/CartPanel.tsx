import React, { useState, useEffect, useRef } from 'react'
import './CartPanel.css'
import useCartContext from '@/contexts/CartContext'
import useUsersContext from '@/contexts/UsersContext'
import Barcode from 'react-barcode'
import ProductIcon from '@/components/icon/Icon'


interface ItemInCartProps {
    item: ItemInCart;
    index: number;
    justAdded: boolean;
}
const ItemInCart: React.FC<ItemInCartProps> = ({item, index, justAdded}) => {
    return (
        <li key={`${item.id}-${index}`} className={`itemsInCart-item ${justAdded ? 'blinking' : ''}`}>
            <ProductIcon item={item} />
            <p>{item.name}</p>
            <p>{item.quantity} st</p>
        </li>
    )
}

const CartPanel: React.FC = () => {
    const { itemsInCart, purchaseCart, payingUser, setPayingUser, emptyCart } = useCartContext();
    const { users } = useUsersContext();

    const [ blinkingId, setBlinkingId ] = useState<string | null>(null);
    const prevQuantitiesRef = useRef<Map<string, number>>(new Map());

    useEffect(() => {
        const prevQuantities = prevQuantitiesRef.current;

        // find an item whose quantity increased (or is brand new)
        const bumped = itemsInCart.find((item) => {
            const prevQty = prevQuantities.get(item.id) ?? 0;
            return item.quantity > prevQty;
        });

        if (bumped) {
            setBlinkingId(bumped.id);
            const timeout = setTimeout(() => setBlinkingId(null), 1000);
            prevQuantitiesRef.current = new Map(itemsInCart.map((i) => [i.id, i.quantity]));
            return () => clearTimeout(timeout);
        }

        prevQuantitiesRef.current = new Map(itemsInCart.map((i) => [i.id, i.quantity]));
    }, [itemsInCart]);


    const CartItems: React.FC = () => {
        return (
            <>
                {itemsInCart.map((item, index) => (
                    <ItemInCart
                        key={`${item.id}-${index}`}
                        item={item}
                        index={index}
                        justAdded={item.id === blinkingId}
                    />
                ))}
            </>
        )
    }

    return (
        <div className='shopping-cart panel'>
            <header>
                <h2>Kundvagn</h2>
                <button className='empty-itemsInCart-button' onClick={emptyCart} title="Töm kundvagn">
                    {/* <img src={emptyCartIcon} alt="Töm kundvagn" className='itemsInCart-icon' height={40}/> */}
                    <Barcode 
                        value="emptyCart"
                        format="CODE128"
                        width={1}
                        height={20}
                        text="Töm" 
                    />
                </button>
            </header>

            <hr />
            
            <ul>
                {itemsInCart.length === 0 ? <p className='empty-itemsInCart'>Kundvagnen är tom</p> : null}
                <CartItems />
            </ul>


            <div>
                <label htmlFor="user-select">Streckas på:</label>
                <select value={payingUser ? payingUser.id : ""} className='selected-user' onChange={(e) => {
                    const selectedUserId = e.target.value;
                    const selectedUser = users.find(user => user.id === selectedUserId);
                    setPayingUser(selectedUser || null);
                }}>
                    <option value="">Ingen</option>
                    {users.map(user => (
                        <option key={user.id} value={user.id}>{user.nick}</option>
                    ))}
                </select>
            </div>

            <button className='checkout-button' onClick={() =>purchaseCart("Bought with skrubblista")} disabled={payingUser == null || itemsInCart.length === 0}>
                
                <Barcode
                    value="checkout"
                    format="CODE128"
                    className="barcode"
                    height={60}
                    text="Strecka"
                />
            </button>
        </div>
    )
}
     
export default CartPanel;
