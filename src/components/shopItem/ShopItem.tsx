import React from 'react';
import './ShopItem.css';

import favouriteIcon from '@/assets/images/favourite.svg';
import favouriteIconFilled from '@/assets/images/favourite-filled.svg';
import defaultItemImage from '@/assets/images/grocery.svg';

import useCartContext from '@/contexts/CartContext';
import useInventoryContext from '@/contexts/InventoryContext';
import useModalContext from '@/contexts/ModalContext';
import useAuthContext from '@/contexts/AuthContext';

import { useLongPress } from '@/hooks/useLongPress';
import SwishQRCode from '@/components/swishQRCode/SwishQRCode';

interface ProductProps {
    item: Item;
}
const SWISH_PAYEE_NUMBER = '0706649794'; // TODO: move to env/config

const Item: React.FC<ProductProps> = ({ item }) => {
    const { addItemToCart, itemsInCart } = useCartContext(); 
    const { toggleFavourite } = useInventoryContext();
    const { openModal } = useModalContext();
    const { currentUser } = useAuthContext();

    const internalPrice: string = item.internalPrice % 1 === 0 ? item.internalPrice.toFixed(0) : item.internalPrice.toFixed(2)

    const longPress = useLongPress({
        onLongPress: () => openModal(<SwishQRCode item={item} payeeNumber={SWISH_PAYEE_NUMBER} />),
        onClick: () => addItemToCart(item),
    });

    return (
        <div className="shop-item" {...longPress}>
            { currentUser && ( // only show favourite button if logged in as a user, and not as a client
                <button className='favourite-button' onClick={(e) => {e.stopPropagation(); toggleFavourite(item.id)}}>
                    <img 
                        src={item.favorite ? favouriteIconFilled : favouriteIcon}
                        className='favourite-icon'
                        alt="heart" 
                        height={20}
                    />
                </button>
            )}

            {itemsInCart.find(cartItem => cartItem.id === item.id) && (
                <p className='items-indicator'>
                    {itemsInCart.find(i => i.id === item.id)?.quantity}
                </p>
            )}

            <div className='shop-item-image'>
                <img
                    src={item.icon || defaultItemImage}
                    className='shop-item-icon'
                    alt={item.name}
                    onError={(e) => {
                        e.currentTarget.onerror = null; // prevent loop
                        e.currentTarget.src = defaultItemImage;
                    }}
                />
            </div>

            <div className='shop-item-info'>
                <h2>{item.name}</h2>

                <div className='item-stats'>
                    <p>{Math.max(item.amountInStock, 0)} st kvar</p>
                    <p>{internalPrice}:-</p>
                </div>
            </div>
        </div>
    );
};

export default Item;
