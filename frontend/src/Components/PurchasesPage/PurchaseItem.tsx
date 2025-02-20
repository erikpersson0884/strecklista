import React from 'react';
import { Purchase } from '../../Types';
import { usePurchasesContext } from '../../Contexts/PurchasesContext';
import PopupDiv from '../PopupDiv/PopupDiv';

interface PurchaseItemProps {
    purchase: Purchase;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const { deletePurchase } = usePurchasesContext();

    const [ showPopupDiv, setShowPopupDiv ] = React.useState(false);

    const total = purchase.items.reduce((acc, item) => acc + item.price * item.amount, 0);

    const handleDelete = () => {
        deletePurchase(purchase.id);
    };

    return (
        showDetails ?
        <>
            <li className="purchase-item-detailed purchase-item">
                <button onClick={() => setShowPopupDiv(true)} className="delete-button">
                    <img src="images/delete-white.svg" alt="Delete" />
                </button>

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
                <PopupDiv 
                    title='Delete purchase'
                    acceptButtonText='Stryk kvitto' 

                    doAction={handleDelete} 
                    showPopupDiv={showPopupDiv}
                    setShowPopupDiv={setShowPopupDiv}
                    className='delete-purchase-popup'
                >
                    <p>Är du säker på att du vill stryka denna transaktion?</p>

                    <p>{new Date(purchase.date).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                    <p>Streckat av {purchase.buyingUser.nick}</p>
                    <p>Streckat på {purchase.paygingUser.nick}</p>
                </PopupDiv>
            </>
        :
            <li className="purchase-item purchase-item-preview">
                <p>{new Date(purchase.date).toISOString().split('T')[0]}</p>
                <p>{purchase.paygingUser.name}</p>
                <p>{total}kr</p>
                <button onClick={() => setShowDetails(true)}>Show Details</button>
            </li>
    );
};

export default PurchaseItem;