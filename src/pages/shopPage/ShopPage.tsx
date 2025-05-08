import React from 'react';
import Product from './product/Product';
import './shopPage.css';
import { useInventory } from '../../contexts/InventoryContext';
import { useCart } from '../../contexts/CartContext';
import Cart from './cart/Cart';
import Shadowbox from '../../components/Shadowbox/Shadowbox';
import shoppingCartIcon from '../../assets/images/shoppingcart.svg';
import closeIcon from '../../assets/images/close.svg';


const ShopPage: React.FC = () => {
    const { products } = useInventory();
    const { numberOfProductsInCart } = useCart();
    const [displayCart, setDisplayCart] = React.useState<boolean>(false);
    const [searchTerm, setSearchTerm] = React.useState<string>('');

    return (
        <>
            {displayCart &&
                <Shadowbox onClick={() => setDisplayCart(false)} >
                    <Cart closeCart={() => setDisplayCart(false)}/> 
                </Shadowbox>
            }
            
            <div className='search-bar-container'>
                <input
                    type="text" 
                    className='search-bar' 
                    placeholder='Sök efter produkter...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                    className='clear-button no-button-formatting' 
                    onClick={() => setSearchTerm('')}
                >
                    <img src={closeIcon} alt="clear search" height={20}/>
                </button>
            </div>

            <div className='shop-page'>


                {products.filter((product: ProductT) => 
                    product.favorite == true && 
                    product.available &&
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((product: ProductT) => 
                    <Product key={product.id} product={product} />
                )}
                
                {products.filter((product: ProductT) => 
                    product.favorite == false && 
                    product.available && 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((product: ProductT) => 
                    <Product key={product.id} product={product} />
                )}
            </div>

            <button 
                className='showCartButton no-button-formatting' 
                onClick={() => setDisplayCart(!displayCart)}
            >
                <div className='items-indicator'>{numberOfProductsInCart}</div>
                <img src={shoppingCartIcon} alt="shopping cart" height={20}/>
            </button>
        </>

    );
};

export default ShopPage;
