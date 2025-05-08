import { InventoryProvider } from './contexts/InventoryContext';
import { CartProvider } from './contexts/CartContext';
import { UsersProvider } from './contexts/UsersContext';
import { TransactionsProvider } from './contexts/TransactionsContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <UsersProvider>
            <InventoryProvider>
                <CartProvider>
                    <TransactionsProvider>
                        {children}
                    </TransactionsProvider>
                </CartProvider>
            </InventoryProvider>
        </UsersProvider>
    )
}

export default Providers;
