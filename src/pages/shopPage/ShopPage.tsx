import React from 'react';
import Product from './product/Product';
import './ShopPage.css';
import { useInventory } from '../../contexts/InventoryContext';
import { useCart } from '../../contexts/CartContext';
import Cart from './cart/Cart';
import Modal from '../../components/modal/Modal';
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
                <Modal onClose={() => setDisplayCart(false)}>
                    <Cart closeCart={() => setDisplayCart(false)}/> 
                </Modal>
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
                    className='clear-search-bar-button no-button-formatting' 
                    onClick={() => setSearchTerm('')}
                >
                    <img src={closeIcon} alt="clear search" height={20}/>
                </button>
            </div>

            <div className='shop-page page'>


                {products.filter((product: IProduct) => 
                    product.favorite == true && 
                    product.available &&
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((product: IProduct) => 
                    <Product key={product.id} product={product} />
                )}
                
                {products.filter((product: IProduct) => 
                    product.favorite == false && 
                    product.available && 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((product: IProduct) => 
                    <Product key={product.id} product={product} />
                )}
            </div>

            {numberOfProductsInCart  !== 0 && <OpenCartButton onClick={() => setDisplayCart(true)}/>}
        </>

    );
};

const OpenCartButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { numberOfProductsInCart } = useCart();
    return (
        <button className='showCartButton no-button-formatting' onClick={onClick}>
            <div className='items-indicator'>{numberOfProductsInCart}</div>
            <img src={shoppingCartIcon} alt="shopping cart" height={20}/>
        </button>
    );
}

export default ShopPage;
