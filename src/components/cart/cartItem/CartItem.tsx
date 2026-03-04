import './CartItem.css';

import { useCart } from '../../../contexts/CartContext';
import deleteIcon from '../../../assets/images/delete-white.svg';
import plusIcon from '../../../assets/images/plus.svg';
import minusIcon from '../../../assets/images/minus.svg';

interface CartItemProps {
    item: ProductInCart;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { removeProductFromCart, increaseProductQuantity, decreaseProductQuantity, setProductQuantity } = useCart();

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = e.target.value === '' ? 0 : Number(e.target.value); // if i just click remove button, i want it to be zero, not NaN
        if (isNaN(newQuantity) || newQuantity < 0) return;
        setProductQuantity(item.id, newQuantity);
    };

    return( 
        <li className='cart-item' key={item.id}>
            <p className='item-name'>{item.name}</p>

            <button onClick={() => increaseProductQuantity(item)}>
                <img src={plusIcon} alt="plus" height={10}/>
            </button>

            <input className='item-quantity' type="string" min={1} value={item.quantity} onChange={handleQuantityChange} />

            <button onClick={() => decreaseProductQuantity(item)}>
                <img src={minusIcon} alt="minus" height={10}/>
            </button>

            <button onClick={() => removeProductFromCart(item)}>
                <img src={deleteIcon} alt="delete" height={10}/>
            </button>
        </li>
    )
}

export default CartItem;
