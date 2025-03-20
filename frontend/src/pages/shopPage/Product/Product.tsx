import React from 'react';
import { Product as ProductT } from '../../../Types';
import './Product.css';

import favouriteIcon from '../../../assets/images/favourite.svg';
import favouriteIconFilled from '../../../assets/images/favourite-filled.svg';


import { useCart } from '../../../contexts/CartContext';

interface ProductProps {
    product: ProductT;
    toggleFavourite: (product: ProductT) => void;
    isFavourite: boolean;
}

const Product: React.FC<ProductProps> = ({ product, isFavourite, toggleFavourite }) => {
    
    const {addProduct} = useCart();

    return (
        <div className="product" onClick={() => addProduct(product)}>
            <button className='favourite-button' onClick={(e) => {e.stopPropagation(); toggleFavourite(product)}}>

                {isFavourite ? 
                    <img 
                        src={favouriteIconFilled}
                        alt="heart" 
                        height={20}
                    />
                    :
                    <img 
                        src={favouriteIcon}
                        alt="heart" 
                        height={20}
                    />
                }
            </button>

            <div className='product-image'>
                <img src={product.icon} alt={product.name} />
            </div>

            <div className='product-info'>
                <h2>{product.name}</h2>

                <div className='product-stats'>
                    <p>{product.amountInStock} i lager</p>
                    <p>{product.price.toFixed(0)}:-</p>
                </div>
            </div>
        </div>
    );
};

export default Product;
