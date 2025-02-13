import React from 'react';
import './PurchasesPage.css';

import { usePurchasesContext } from '../../Contexts/PurchasesContext';
import PurchaseItem from './PurchaseItem';

const PurchasesPage: React.FC = () => {
    const { purchases } = usePurchasesContext();


    return (
        <div>
            <h1>Purchases</h1>
            <ul>
                {purchases.map((purchase) => (
                    <PurchaseItem key={purchase.id} purchase={purchase} />
                ))}
            </ul>
            
        </div>
    );
};

export default PurchasesPage;
