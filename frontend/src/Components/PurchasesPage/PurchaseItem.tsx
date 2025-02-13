import React from 'react';
import { Purchase } from '../../Types';

interface PurchaseItemProps {
    purchase: Purchase;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase }) => {
    const [showDetails, setShowDetails] = React.useState(false);

    const total = purchase.items.reduce((acc, item) => acc + item.price * item.amount, 0);

    return (
        showDetails ?
            <li className="purchase-item-detailed purchase-item">
                <p>Datum: {new Date(purchase.date).toISOString().split('T')[0]}</p>
                <p>Streckat av: {purchase.buyingUser.name}</p>
                <p>Streckat på: {purchase.paygingUser.name}</p>
                < hr/>

                <ul>
                    <li>
                        <p>Vara</p>
                        <p>Antal</p>
                        <p>Pris</p>
                    </li>
                    < hr />
                    {purchase.items.map((item) => (
                        <li key={item.name}>
                            <p>{item.name}</p>
                            <p>{item.amount}st</p>
                            <p>{item.price}kr</p>
                        </li>
                    ))}
                </ul>

                <hr/>
                
                <div className="total">
                    <p>Totalt</p>
                    <p>{total}kr</p>
                </div>

                <button onClick={() => setShowDetails(false)}>Hide Details</button>
            </li>
        :
            <li className="purchase-item">
                <p>{new Date(purchase.date).toISOString().split('T')[0]}</p>
                <p>{purchase.paygingUser.name}</p>
                <p>{total}kr</p>
                <button onClick={() => setShowDetails(true)}>Show Details</button>
            </li>
    );
};

export default PurchaseItem;