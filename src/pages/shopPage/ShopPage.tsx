import React from 'react';
import './ShopPage.css';

import ShopItem from '../../components/shopItem/ShopItem';
import { useInventory } from '../../contexts/InventoryContext';
import { useCart } from '../../contexts/CartContext';
import Cart from '../../components/cart/Cart';
import Modal from '../../components/modal/Modal';
import emptySearchIcon from '../../assets/images/close.svg';


const ShopPage: React.FC = () => {
    const { products } = useInventory();
    const { numberOfProductsInCart } = useCart();
    const [displayCart, setDisplayCart] = React.useState<boolean>(false);
    const [searchTerm, setSearchTerm] = React.useState<string>('');

    return (
        <div className='page'>
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
                    className='clear-search-bar-button' 
                    onClick={() => setSearchTerm('')}
                >
                    <img src={emptySearchIcon} alt="clear search" height={20}/>
                </button>
            </div>

            <div className='shop-items'>
                {products.filter((item: IItem) => 
                    item.favorite == true && 
                    item.available &&
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item: IItem) => 
                    <ShopItem key={item.id} item={item} />
                )}
                
                {products.filter((item: IItem) => 
                    item.favorite == false && 
                    item.available && 
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item: IItem) => 
                    <ShopItem key={item.id} item={item} />
                )}
            </div>

            {numberOfProductsInCart  !== 0 && <OpenCartButton onClick={() => setDisplayCart(true)}/>}
        </div>

    );
};

const OpenCartButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { numberOfProductsInCart } = useCart();
    return (
        <button className='show-cart-button' onClick={onClick}>
            <div className='items-indicator'>{numberOfProductsInCart}</div>
            <p>Betala</p>
        </button>
    );
}

export default ShopPage;
