import React from 'react';
import TransactionsItem from './TransactionItem';


interface DepositItemProps {
    deposit: Deposit;
}

const DepositItem: React.FC<DepositItemProps> = ({ deposit }) => {

    return (
        <TransactionsItem 
            transaction={deposit} 
            transactionType='Insättning'
            previewName={deposit.createdFor.nick}
            total={deposit.total}
        >
            <p>Datum: {new Date(deposit.createdTime).toISOString().split('T')[0]}</p>
            <br />
            <p>Fyllts på utav: {deposit.createdBy.nick}</p>
            <p>Fyllt på konto: {deposit.createdFor.nick}</p>
            <p className='total'>Summa: {deposit.total}kr</p>
        </TransactionsItem>
    );
};

export default DepositItem;
