import React from 'react';
import { Deposit } from '../../../Types';
import deleteIcon from '../../../assets/images/delete-white.svg';
import DeleteTransactionPopup from '../DeleteTransactionPopup';

interface DepositItemProps {
    deposit: Deposit;
    closeDetails: () => void;
}

const DepositItem: React.FC<DepositItemProps> = ({ deposit, closeDetails }) => {
    const [showPopupDiv, setShowPopupDiv] = React.useState(false);

    return (
        <>
            <li className="transaction-item-detailed transaction-item">
                <button onClick={() => setShowPopupDiv(true)} className="delete-button">
                    <img src={deleteIcon} alt="Delete" />
                </button>

                <div>
                    <p>Datum: {new Date(deposit.createdTime).toISOString().split('T')[0]}</p>
                    <br />
                    <p>Fyllts på utav: {deposit.createdBy.nick}</p>
                    <p>Fyllt på konto: {deposit.createdFor.nick}</p>
                    <p className='total'>Summa: {deposit.total}kr</p>
                </div>

                <button onClick={closeDetails}>Visa mindre</button>
            </li>
            <DeleteTransactionPopup
                transaction={deposit}
                showPopupDiv={showPopupDiv}
                setShowPopupDiv={setShowPopupDiv}
            />
        </>
    );
};



export default DepositItem;
