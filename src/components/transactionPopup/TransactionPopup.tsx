import { type FC } from "react";
import './TransactionPopup.css';

import useTransactionsContext from "../../contexts/TransactionsContext";
import useUsersContext from "../../contexts/UsersContext";
import useModalContext from "../../contexts/ModalContext";

import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";
import PopupWindow from "../popupWindow/PopupWindow";
import ConfirmDialog from "../confirmDialog/ConfirmDialog";


interface TransactionPopupProps {
    transaction: ITransaction;
}

const TransactionPopup: FC<TransactionPopupProps> = ({transaction}) => {
    const { removeTransaction } = useTransactionsContext();
    const { getUserFromUserId } = useUsersContext();
    const { openModal, closeModal } = useModalContext();


    const handleRemoveTransaction = async () => {
        const success = await removeTransaction(transaction.id);
        if (success) closeModal();
    }

    const openConfirmDeleteDialog = () => {
        openModal(
            <ConfirmDialog
                title="Stryk Transaktion"
                confirmButtonText="Stryk"
                onConfirm={() => handleRemoveTransaction()}
            >
                <p>Är du säker på att du vill stryka denna transaktion?</p>
            </ConfirmDialog>
        );
    }


    const Details: FC = () => {
        if (transaction.type === 'purchase' || transaction.type === 'stockUpdate') {
            const purchase = transaction as Purchase | StockUpdate;

            return (
                <div className="receipt-details">
                    <p>Produkter</p>
                    <ul className="receipt-list">
                        {purchase.items.map((item, index) => (
                            <li className="receipt-item" key={index}>
                                <p>
                                    {transaction.type === "purchase"
                                        ? (item as PurchasedItem).item.displayName
                                        : (item as StockUpdateItem).name}
                                </p>

                                {transaction.type === "purchase" && (
                                    <p>{(item as PurchasedItem).quantity}st</p>
                                )}

                                {transaction.type === "purchase" && (
                                    <p>
                                        {(item as PurchasedItem).purchasePrice.price *
                                            (item as PurchasedItem).quantity} kr
                                    </p>
                                )}

                                {transaction.type === "stockUpdate" && (
                                    <p>
                                        {(item as StockUpdateItem).after -
                                            (item as StockUpdateItem).before} st
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }
        else if (transaction.type === 'deposit') {
            return null; // No additional details for deposits
        }
        else {
            return <p>Unknown transaction type</p>;
        }
    };

    let dateString: string;
    let timeString: string;
    const d = new Date(transaction.createdTime);
    if (isNaN(d.getTime())) {
        dateString = String(transaction.createdTime);
        timeString = '';
    } else {
        const pad = (n: number) => String(n).padStart(2, '0');
        dateString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        timeString = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    let comment: string | null = null;
    if (transaction.type === 'purchase' || transaction.type === 'deposit') comment = (transaction as Purchase | Deposit).comment;

    const PopupContent: FC = () => {
        return (
            <>
                <div className="transaction-overview">
                    <div className="transaction-time">
                        <div className="transaction-bubble">{dateString}</div>
                        <div className="transaction-bubble">{timeString}</div>
                    </div>  

                    <div>
                        { 'createdFor' in transaction && (
                            <p>
                                <span>Berört konto:</span>
                                <span>{(() => {
                                    const user = getUserFromUserId((transaction as FinancialTransaction).createdFor);
                                    return typeof user === "string" ? user : user.nick;
                                })()}</span>
                            </p>
                        )}

                        <p>
                            <span>Utförd av:</span>
                            <span>{transaction.createdBy.type === "user"
                                ? (() => {
                                    const user = getUserFromUserId(transaction.createdBy.id);
                                    return typeof user === "string" ? user : user.nick;
                                })()
                                : "En klient"}</span>
                        </p>

                        {transaction.type ==="deposit" && (
                            <p>
                                <span>Insättning:</span>
                                <span>{(transaction as Deposit).total} kr</span>
                            </p>
                        )}

                        {transaction.type ==="purchase" && (
                            <p>
                                <span>Totalt:</span>
                                <span>{(transaction as Purchase).total}kr</span>
                            </p>
                        )}
                    </div>
                    
                    { comment && (
                        <p className="comment-container">
                            <span>Kommentar:</span>
                            <span className="comment">{comment}</span>
                        </p>
                    )}
                    
                </div>

                <Details />
            </>
        )
    }

    if (transaction.removed) return (
        <PopupWindow
            title={"Struken" + transaction.type}
            className="transaction-popup"
        >
            <PopupContent />
        </PopupWindow>
    )
    else {
        let transactionTypeString: string;
        switch (transaction.type) {
            case 'purchase': 
                transactionTypeString = 'Köp';
                break;
            case 'deposit':
                transactionTypeString = 'Insättning';
                break;
            case 'stockUpdate':
                transactionTypeString = 'Lageruppdatering';
                break;
            default:
                transactionTypeString = 'Okänd';
        }

        return <ActionPopupWindow
            title={transactionTypeString}
            className="transaction-popup"
            acceptButtonText="Stryk Transaktion"
            onAccept={openConfirmDeleteDialog}
        >
           <PopupContent />
        </ActionPopupWindow>
    }
}

export default TransactionPopup;
