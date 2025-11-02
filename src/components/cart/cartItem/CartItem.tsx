import deleteIcon from '../../../assets/images/delete-white.svg';
import { useCart } from '../../../contexts/CartContext';
import './CartItem.css';

interface CartItemProps {
    item: ProductInCart;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { removeProductFromCart, increaseProductQuantity, decreaseProductQuantity } = useCart();

    return( 
        <li className='cart-item' key={item.id}>
            <span>{item.quantity}x</span>
            <span className='item-name'>{item.name}</span>

            <button onClick={() => increaseProductQuantity(item)}>+</button>

            <button onClick={() => decreaseProductQuantity(item)}>-</button>

            {/* <span className='item-price'>{(item.quantity * item.internalPrice).toFixed(1).replace(/\.0$/, '')}kr</span> */}

            <button onClick={() => removeProductFromCart(item)}>
                <img src={deleteIcon} alt="delete" height={10}/>
            </button>
        </li>
    )
}

export default CartItem;
