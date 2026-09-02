import React from 'react';
import './ShopPage.css';

import ShopItem from '../../components/shopItem/ShopItem';
import { useInventory } from '../../contexts/InventoryContext';
import { useCart } from '../../contexts/CartContext';
import Cart from '../../components/cart/Cart';
import Modal from '../../components/modal/Modal';
import emptySearchIcon from '../../assets/images/close.svg';


const ShopPage: React.FC = () => {
    const { items } = useInventory();
    const { numberOfProductsInCart } = useCart();

    const [ displayCart, setDisplayCart ] = React.useState<boolean>(false);
    const [ searchTerm, setSearchTerm ] = React.useState<string>('');

    return (
        <div className='page'>
            <Modal isOpen={displayCart} onClose={() => setDisplayCart(false)}>
                <Cart closeCart={() => setDisplayCart(false)}/> 
            </Modal>

            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <ShopItems items={items} searchTerm={searchTerm} />
            
            <OpenCartButton isVisible={numberOfProductsInCart > 0 && !displayCart} onClick={() => setDisplayCart(true)}/>
        </div>

    );
};

interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}
const SearchBar: React.FC<SearchBarProps> = ({searchTerm, setSearchTerm}) => {
    return (
        <div className='search-bar-container'>
            <input
                type="text" 
                className='search-bar' 
                placeholder='Sök efter produkter...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            { (searchTerm.length > 0) && <button 
                className='clear-search-bar-button' 
                onClick={() => setSearchTerm('')}
            >
                <img src={emptySearchIcon} alt="clear search" height={20}/>
            </button>
            }
        </div>
    )
};

interface ShopItemsProps {
    items: Item[];
    searchTerm: string;
}
const ShopItems: React.FC<ShopItemsProps> = ({ items, searchTerm}) => {
    if (items.length === 0) {
        <div className='no-items'>
                <p>Inga produkter hittades</p>
            </div>
    }
    else return (
        <div className='shop-items'>
            {items.filter((item: Item) => 
                item.favorite == true && 
                item.available &&
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((item: Item) => 
                <ShopItem key={item.id} item={item} />
            )}
            
            {items.filter((item: Item) => 
                item.favorite == false && 
                item.available && 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((item: Item) => 
                <ShopItem key={item.id} item={item} />
            )}
        </div>
    )
}

interface OpenCartButtonProps {
    isVisible: boolean;
    onClick: () => void;
}
const OpenCartButton: React.FC<OpenCartButtonProps> = ({ isVisible, onClick }) => {
    const { numberOfProductsInCart } = useCart();
    if (!isVisible) return null;
    else return (
        <button className='show-cart-button' onClick={onClick}>
            <div className='items-indicator'>{numberOfProductsInCart}</div>
            <p>Strecka</p>
        </button>
    );
}

export default ShopPage;
