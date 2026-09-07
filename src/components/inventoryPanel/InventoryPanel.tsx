import React from 'react'
import './InventoryPanel.css'
import ScannerComponent from '@/components/scannerComponent/ScannerComponent'
import ProductIcon from '@/components/productIcon/ProductIcon'

import { useInventoryContext } from '@/contexts/InventoryContext'
import { useCartContext } from '@/contexts/CartContext'
import Barcode from 'react-barcode'

const InventoryPanel: React.FC = () => {
    const { items } = useInventoryContext();
    const { addItemToCart } = useCartContext();

    return (
        <div className='inventory-panel panel'>
            <p className='section-label'>STRÄCKA PÅ VEM?</p>

            <ScannerComponent className='scanner'/>

            <ul>
                {[...items]
                    .sort((a, b) => {
                        const aHasExternalId = Boolean(a.externalId);
                        const bHasExternalId = Boolean(b.externalId);

                        if (aHasExternalId !== bHasExternalId) {
                            return aHasExternalId ? -1 : 1;
                        }

                        return b.timesPurchased - a.timesPurchased;
                    })
                    .map(item => (
                    <li key={item.id} onClick={() => addItemToCart(item)} className='inventory-item'>
                        <ProductIcon item={item} />
                        <div>
                            <p>{item.name}</p>
                            <p className='sub-text'>{Math.max(0, item.amountInStock)} st kvar</p>
                        </div>
                        

                        {item.externalId && (
                            <Barcode
                                value={item.externalId}
                                format="CODE128"
                                className="barcode"
                                displayValue={false}
                                height={40}
                                width={2}
                            />
                        )}
                    </li>
                    ))}
            </ul>
        </div>
    )
}

export default InventoryPanel
