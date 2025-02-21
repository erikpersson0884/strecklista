import React from 'react';
import './PurchasesPage.css';

import { usePurchasesContext } from '../../Contexts/PurchasesContext';
import PurchaseItem from './PurchaseItem';

const PurchasesPage: React.FC = () => {
    const { purchases } = usePurchasesContext();


    return (
        <div className='purchases-page'>
            <ul className='purchases-list'>
                {purchases.map((purchase) => (
                    <PurchaseItem key={purchase.id} purchase={purchase} />
                ))}
            </ul>
            
        </div>
    );
};

export default PurchasesPage;
