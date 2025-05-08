import React from 'react';
import PopupDiv from '../../components/PopupDiv/PopupDiv';
import { useTransactionsContext } from '../../contexts/TransactionsContext';

interface DeleteTransactionPopupProps {
    transaction: Transaction;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteTransactionPopup: React.FC<DeleteTransactionPopupProps> = ({transaction, isOpen, onClose}) => {
    const { deleteTransaction } = useTransactionsContext();

    const handleDelete = () => {
        deleteTransaction(transaction.id);
    };
    
    return (
        <PopupDiv
            title="Stryk Transaktion"
            acceptButtonText="Stryk Transaktion"
            onAccept={handleDelete}
            isOpen={isOpen}
            onClose={onClose}
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
