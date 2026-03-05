import { InventoryProvider } from './contexts/InventoryContext';
import { CartProvider } from './contexts/CartContext';
import { UsersProvider } from './contexts/UsersContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { ModalProvider } from './contexts/ModalContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <UsersProvider>
            <InventoryProvider>
                <TransactionsProvider>
                    <CartProvider>
                        <ModalProvider>
                            {children}
                        </ModalProvider>
                    </CartProvider>
                </TransactionsProvider>
            </InventoryProvider>
        </UsersProvider>
    )
}

export default Providers;
