import React from 'react';
import deleteIcon from '../../../assets/images/delete-white.svg';
import DeleteTransactionPopup from '../DeleteTransactionPopup';

interface PurchaseItemProps {
    purchase: Purchase;
    closeDetails: () => void;
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({ purchase, closeDetails }) => {
    const [showPopupDiv, setShowPopupDiv] = React.useState(false);

    return (
        <>
            <li className="transaction-item-detailed transaction-item">
                <button onClick={() => setShowPopupDiv(true)} className="delete-button">
                    <img src={deleteIcon} alt="Delete" />
                </button>

                <div>
                    <p>Datum: {new Date(purchase.createdTime).toISOString().split('T')[0]}</p>

                    <br />
                    <p>Streckat av: {purchase.createdBy.nick}</p>
                    <p>Streckat på: {purchase.createdFor.nick}</p>
                </div>

                <ReceiptDiv purchase={purchase}/>

                <button onClick={closeDetails}>Visa mindre</button>
            </li>
            
            <DeleteTransactionPopup
                transaction={purchase}
                showPopupDiv={showPopupDiv}
                setShowPopupDiv={setShowPopupDiv}
            />
        </>
    );
};


interface ReceiptDivProps {
    purchase: Purchase;
}
const ReceiptDiv: React.FC<ReceiptDivProps> = ({ purchase }) => {
    const total = purchase.items.reduce((acc, item) => acc + item.purchasePrice.price * item.quantity, 0);

    return (
        <div>
            <ul className='receipt-list'>
                <li className='receipt-item'>
                    <p>Vara</p>
                    <p>Antal</p>
                    <p>Pris</p>
                    <p>Totalt</p>
                </li>
                <hr />
                {purchase.items.map((item,index) => (
                    <li className='receipt-item' key={index}>
                        <p>{item.item.displayName}</p>
                        <p>{item.quantity} st</p>
                        <p>{item.purchasePrice.price} kr</p>
                        <p>{item.purchasePrice.price * item.quantity} kr</p>
                    </li>
                ))}
                <li className='receipt-item total'>
                    <p>Totalt</p>
                    <p>{total}kr</p>
                </li>
            </ul>
        </div>

    );
}

export default PurchaseItem;
