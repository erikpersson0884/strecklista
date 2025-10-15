import React from 'react';
import './shopItem.css';

import favouriteIcon from '../../assets/images/favourite.svg';
import favouriteIconFilled from '../../assets/images/favourite-filled.svg';

import { useCart } from '../../contexts/CartContext';
import { useInventory } from '../../contexts/InventoryContext';

interface ProductProps {
    item: IItem;
}

const Item: React.FC<ProductProps> = ({ item }) => {
    const { addIProductoCart, itemsInCart } = useCart(); 
    const { toggleFavourite } = useInventory();

    const internalPrice: string = item.internalPrice % 1 === 0 ? item.internalPrice.toFixed(0) : item.internalPrice.toFixed(2)

    return (
        <div className="item" onClick={() => addIProductoCart(item)}>
            <button className='favourite-button' onClick={(e) => {e.stopPropagation(); toggleFavourite(item.id)}}>
                <img 
                    src={item.favorite ? favouriteIconFilled : favouriteIcon}
                    alt="heart" 
                    height={20}
                />
            </button>

            {itemsInCart.find(cartItem => cartItem.id === item.id) && (
                <p className='items-indicator'>
                    {itemsInCart.find(i => i.id === item.id)?.quantity}
                </p>
            )}

            <div className='item-image'>
                <img src={item.icon} alt={item.name} />
            </div>

            <div className='item-info'>
                <h2>{item.name}</h2>

                <div className='item-stats'>
                    <p>{item.amountInStock} i lager</p>
                    <p>{internalPrice}:-</p>
                </div>
            </div>
        </div>
    );
};

export default Item;
