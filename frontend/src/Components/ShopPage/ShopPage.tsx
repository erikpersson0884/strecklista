import React from 'react';
import Drink from './Product/Product';
import './shopPage.css';
import { useInventory } from '../../Contexts/InventoryContext';
import Cart from './Cart/Cart';
import Shadowbox from '../Shadowbox/Shadowbox';


const ShopPage: React.FC = () => {
    const { products } = useInventory();

    const [displayCart, setDisplayCart] = React.useState<boolean>(false);

    return (
        <>
            {displayCart ? 
                <Shadowbox onClick={() => setDisplayCart(false)} >
                    <Cart closeCart={() => setDisplayCart(false)}/> 
                </Shadowbox>
            : 
                null
            }

            <div className='shopPage'>
                {products.map((product, index) => (
                <Drink key={index} product={product} />
                ))}
            </div>

            <button className='showCartButton no-button-formatting' onClick={() => setDisplayCart(!displayCart)}>
                <img src="images/shoppingcart.svg" alt="shopping cart" height={20}/>
            </button>
        </>

    );
};

export default ShopPage;