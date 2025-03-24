import ShopPage from '../pages/shopPage/ShopPage';
import Inventory from '../pages/inventoryPage/InventoryPage';
import BalancePage from '../pages/balancePage/BalancePage';
import TransactionsPage from '../pages/transactionsPage/TransactionPage';

export const pages = [
    { url: '/', linkText: 'Strecka', component: <ShopPage /> },
    { url: '/inventory', linkText: 'Inventory', component: <Inventory /> },
    { url: '/balance', linkText: 'Tillgodo', component: <BalancePage /> },
    { url: '/transactions', linkText: 'Transactions', component: <TransactionsPage /> },
]