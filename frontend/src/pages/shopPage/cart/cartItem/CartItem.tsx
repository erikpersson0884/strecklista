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
            <span className='item-name'>{product.name}</span>

            <div className='quantity-container'>
                <button className='add-button' onClick={() => increaseProductQuantity(product)}>+</button>
                <input
                    // className='quantity-input'
                    type='string'
                    value={product.quantity}
                    onChange={(e) => setProductQuantity(product.id, parseInt(e.target.value))}
                    min={1}
                />
                    
                <button className='' onClick={() => decreaseProductQuantity(product)}>-</button>
            </div>

            <span className='item-price'>{product.quantity * product.internalPrice}kr</span>
            <button className='delete-button' onClick={() => removeProductFromCart(product)}>
                <img src={deleteIcon} alt="delete" height={10}/>
            </button>
        </li>
    )
}

export default CartItem;
