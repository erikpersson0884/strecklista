import deleteIcon from '../../../../assets/images/delete-white.svg';
import { useCart } from '../../../../contexts/CartContext';
import './CartItem.css';

interface CartItemProps {
    product: ProductInCart;
}

const CartItem: React.FC<CartItemProps> = ({ product }) => {
    const { removeProductFromCart, setProductQuantity, increaseProductQuantity, decreaseProductQuantity } = useCart();

    return( 
        <li className='cart-item' key={product.id}>
            <span>{product.quantity}x</span>
            <span className='item-name'>{product.name}</span>

            <button onClick={() => increaseProductQuantity(product)}>+</button>

            <button onClick={() => decreaseProductQuantity(product)}>-</button>

            {/* <span className='item-price'>{(product.quantity * product.internalPrice).toFixed(1).replace(/\.0$/, '')}kr</span> */}

            <button onClick={() => removeProductFromCart(product)}>
                <img src={deleteIcon} alt="delete" height={10}/>
            </button>
        </li>
    )
}

export default CartItem;
