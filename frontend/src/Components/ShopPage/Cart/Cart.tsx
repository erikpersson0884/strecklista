import React from 'react';
import './Cart.css';
import { useCart } from '../../../Contexts/CartContext';

const Cart: React.FC = () => {

    const { items, removeItem } = useCart();
    const { buyProducts } = useCart();


    return (
        <div className='cart'>
            <h2>Varukorg:</h2>

            <hr />
            
            <ul className='cartList'>
                {items.map((item, index) => (
                    <li key={index}>
                        <span>{item.name}</span>
                        <span>{item.amount}</span>
                        <span>{item.amount * item.price}</span>
                        <button onClick={() => removeItem(item)}>
                            <img src="/images/delete.svg" alt="delete" height={10}/>
                        </button>
                    </li>
                ))}
            </ul>
            
            {items.length === 0 ? <p>Varukorgen är tom</p> : 
                <button className='' onClick={() => buyProducts()}>Strecka</button>
            }

        </div>
    );
};

export default Cart;