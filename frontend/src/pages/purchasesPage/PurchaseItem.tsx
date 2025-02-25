import React from 'react';
import { Purchase } from '../../Types';
import { usePurchasesContext } from '../../contexts/PurchasesContext';
import PopupDiv from '../../components/PopupDiv/PopupDiv';

interface PurchaseItemProps {
    purchase: Purchase;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase }) => {
    const [showDetails, setShowDetails] = React.useState(false);
    const { deletePurchase } = usePurchasesContext();
    const [showPopupDiv, setShowPopupDiv] = React.useState(false);

    const total = purchase.items.reduce((acc, item) => acc + item.price * item.amount, 0);

    const handleDelete = () => {
        deletePurchase(purchase.id);
    };

    return (
        <>
            {!showDetails ? (
                <li className="purchase-item purchase-item-preview">
                    <p>{new Date(purchase.date).toISOString().split('T')[0]}</p>
                    <p>{purchase.paygingUser.nick}</p>
                    <p>{total}kr</p>
                    <button onClick={() => setShowDetails(true)}>Expandera</button>
                </li>
            ) : (
                <li className="purchase-item-detailed purchase-item">
                    <button onClick={() => setShowPopupDiv(true)} className="delete-button">
                        <img src="images/delete-white.svg" alt="Delete" />
                    </button>

                    <div className='purchase-info'>
                        <p>Datum: {new Date(purchase.date).toISOString().split('T')[0]}</p>
                        <p>Streckat av: {purchase.buyingUser.nick}</p>
                        <p>Streckat på: {purchase.paygingUser.nick}</p>
                    </div>


                    {/* <hr /> */}

                    <ReceiptDiv purchase={purchase}/>

                    {/* <hr /> */}



                    <button onClick={() => setShowDetails(false)}>Visa mindre</button>
                </li>
            )}
            <PopupDiv
                title="Delete purchase"
                acceptButtonText="Stryk kvitto"
                doAction={handleDelete}
                showPopupDiv={showPopupDiv}
                setShowPopupDiv={setShowPopupDiv}
                className="delete-purchase-popup"
            >
                <p>Är du säker på att du vill stryka denna transaktion?</p>
                <p>{new Date(purchase.date).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                <p>Streckat av {purchase.buyingUser.nick}</p>
                <p>Streckat på {purchase.paygingUser.nick}</p>
            </PopupDiv>
        </>
    );
};


interface ReceiptDivProps {
    purchase: Purchase;
}
const ReceiptDiv: React.FC<ReceiptDivProps> = ({ purchase }) => {
    const total = purchase.items.reduce((acc, item) => acc + item.price * item.amount, 0);

    return (
        <div>
            <ul className='receipt-list'>
                <li>
                    <p>Vara</p>
                    <p>Antal</p>
                    <p>Pris</p>
                    <p>Totalt</p>
                </li>
                <hr />
                {purchase.items.map((item,index) => (
                    <li key={index}>
                        <p>{item.name}</p>
                        <p>{item.amount} st</p>
                        <p>{item.price} kr</p>
                        <p>{item.price * item.amount} kr</p>
                    </li>
                ))}
                <li className='total'>
                    <p>Totalt</p>
                    <p>{total}kr</p>
                </li>

            </ul>
        </div>

    );
}


export default PurchaseItem;
