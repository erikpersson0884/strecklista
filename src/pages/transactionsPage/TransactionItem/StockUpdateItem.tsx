import React from 'react';
import deleteIcon from '../../../assets/images/delete-white.svg';
import DeleteTransactionPopup from '../DeleteTransactionPopup';

interface StockUpdateItemProps {
    stockUpdate: StockUpdate;
    closeDetails: () => void;
}

const StockUpdateItem: React.FC<StockUpdateItemProps> = ({ stockUpdate, closeDetails }) => {
    const [showPopupDiv, setShowPopupDiv] = React.useState(false);

    return (
        <>
            <li className="transaction-item-detailed transaction-item">
                <button onClick={() => setShowPopupDiv(true)} className="delete-button">
                    <img src={deleteIcon} alt="Delete" />
                </button>

                <div>
                    <p>Datum: {new Date(stockUpdate.createdTime).toISOString().split('T')[0]}</p>
                    <br />
                    <p>Fyllts på utav: {stockUpdate.createdBy.nick}</p>
                </div>

                <div>
                    <ul className='receipt-list'>
                        <li className='receipt-item'>
                            <p>Vara</p>
                            <p>Antal</p>
                        </li>
                        <hr />
                        {stockUpdate.items.map((item,index) => (
                            <li key={index} className='receipt-item'>
                                <p>{item.name}</p>
                                <p>{item.after - item.before} st</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <button onClick={closeDetails}>Visa mindre</button>
            </li>
            <DeleteTransactionPopup
                transaction={stockUpdate}
                isOpen={showPopupDiv}
                onClose={() => setShowPopupDiv(false)}
            />
        </>
    );
};

export default StockUpdateItem;
