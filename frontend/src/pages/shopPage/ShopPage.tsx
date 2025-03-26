import React from 'react';
import Product from './product/Product';
import './shopPage.css';
import { useInventory } from '../../contexts/InventoryContext';
import { useAuth } from '../../contexts/AuthContext';
import Cart from './cart/Cart';
import Shadowbox from '../../components/Shadowbox/Shadowbox';
import { Product as ProductT } from '../../Types';

import shoppingCartIcon from '../../assets/images/shoppingcart.svg';


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
                {products.filter((product: ProductT) => 
                    product.favorite == true && 
                    product.available
                ).map((product: ProductT) => 
                    <Product key={product.id} product={product} />
                )}
                
                {products.filter((product: ProductT) => 
                    product.favorite == false && 
                    product.available
                ).map((product: ProductT) => 
                    <Product key={product.id} product={product} />
                )}
            </div>

            <button className='showCartButton no-button-formatting' onClick={() => setDisplayCart(!displayCart)}>
                <img src={shoppingCartIcon} alt="shopping cart" height={20}/>
            </button>
        </>

    );
};

export default ShopPage;
