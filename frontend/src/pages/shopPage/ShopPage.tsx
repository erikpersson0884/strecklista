import React from 'react';
import Product from './Product/Product';
import './shopPage.css';
import { useInventory } from '../../contexts/InventoryContext';
import Cart from './Cart/Cart';
import Shadowbox from '../../components/Shadowbox/Shadowbox';
import { Product as ProductT } from '../../Types';

import shoppingCartIcon from '../../assets/images/shoppingcart.svg';


const ShopPage: React.FC = () => {
    const { products } = useInventory();

    const [displayCart, setDisplayCart] = React.useState<boolean>(false);
    const [favourites, setFavourites] = React.useState<string[]>([])

    React.useEffect(() => {
        const storedFavourites = localStorage.getItem('favourites');
        if (storedFavourites) {
            setFavourites(JSON.parse(storedFavourites));
        }
    }, []);


    const toggleFavourite = (product: ProductT) => {
        if (favourites.includes(product.id)) {
            setFavourites(favourites.filter((id:string) => id !== product.id));
            localStorage.setItem('favourites', JSON.stringify(favourites.filter((id:string) => id !== product.id)));

        }
        else { // add as favourite
            setFavourites([...favourites, product.id]);
            localStorage.setItem('favourites', JSON.stringify([...favourites, product.id]));
        }

    }

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
                {products.filter((product: ProductT) => favourites.includes(product.id)).map((product: ProductT) => 
                    <Product key={product.id} product={product} toggleFavourite={toggleFavourite} isFavourite={true} />
                )}
                {products.filter((product: ProductT) => !favourites.includes(product.id)).map((product: ProductT) => 
                    <Product key={product.id} product={product} toggleFavourite={toggleFavourite} isFavourite={false}/>
                )}

            </div>

            <button className='showCartButton no-button-formatting' onClick={() => setDisplayCart(!displayCart)}>
                <img src={shoppingCartIcon} alt="shopping cart" height={20}/>
            </button>
        </>

    );
};

export default ShopPage;