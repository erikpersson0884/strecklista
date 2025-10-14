import React from 'react';
import ActionPopupWindow from '../../components/actionPopupWindow/ActionPopupWindow';
import { useTransactionsContext } from '../../contexts/TransactionsContext';

interface DeleteTransactionPopupProps {
    transaction: ITransaction | null;
    isOpen: boolean;
    onClose: () => void;
}

const DeleteTransactionPopup: React.FC<DeleteTransactionPopupProps> = ({transaction, isOpen, onClose}) => {
    if (!transaction) return null;
    
    const { deleteTransaction } = useTransactionsContext();

    const handleDelete = () => {
        deleteTransaction(transaction.id);
    };
    
    return (
        <ActionPopupWindow
            title="Stryk Transaktion"
            acceptButtonText="Stryk Transaktion"
            onAccept={handleDelete}
            isOpen={isOpen}
            onClose={onClose}
            className="delete-purchase-popup"
        >
            <p>Är du säker på att du vill stryka denna transaktion?</p>
            <p>Datum: {new Date(transaction.createdTime).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
            <p>Av: {transaction.createdBy.nick}</p>
            <p>Typ: {transaction.type}</p>
        </ActionPopupWindow>
    );
};

export default DeleteTransactionPopup;
