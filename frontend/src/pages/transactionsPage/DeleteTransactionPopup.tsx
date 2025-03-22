import React from 'react';
import { Transaction } from '../../Types';
import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useTransactionsContext } from '../../contexts/TransactionsContext';

interface DeleteTransactionPopupProps {
    transaction: Transaction;
    showPopupDiv: boolean;
    setShowPopupDiv: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteTransactionPopup: React.FC<DeleteTransactionPopupProps> = ({transaction, showPopupDiv, setShowPopupDiv}) => {
    const { deleteTransaction } = useTransactionsContext();

    const handleDelete = () => {
        deleteTransaction(transaction.id);
    };
    
    return (
        <PopupDiv
            title="Stryk Transaktion"
            acceptButtonText="Stryk Transaktion"
            doAction={handleDelete}
            showPopupDiv={showPopupDiv}
            setShowPopupDiv={setShowPopupDiv}
            className="delete-purchase-popup"
        >
            <p>Är du säker på att du vill stryka denna transaktion?</p>
            <p>{new Date(transaction.createdTime).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
            <p>Av: {transaction.createdBy.nick}</p>
            <p>För: {transaction.createdFor.nick}</p>
        </PopupDiv>
    );
};

export default DeleteTransactionPopup;
