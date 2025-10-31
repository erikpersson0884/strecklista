import { InventoryProvider } from './contexts/InventoryContext';
import { CartProvider } from './contexts/CartContext';
import { UsersProvider } from './contexts/UsersContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { ModalProvider } from './contexts/ModalContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <UsersProvider>
            <InventoryProvider>
                <CartProvider>
                    <TransactionsProvider>
                        <ModalProvider>
                            {children}
                        </ModalProvider>
                    </TransactionsProvider>
                </CartProvider>
            </InventoryProvider>
        </UsersProvider>
    )
}

export default Providers;
