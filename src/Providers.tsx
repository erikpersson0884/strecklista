import { InventoryProvider } from './contexts/InventoryContext';
import { CartProvider } from './contexts/CartContext';
import { UsersProvider } from './contexts/UsersContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { ModalProvider } from './contexts/ModalContext';
import { ClientProvider } from './contexts/ClientContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <UsersProvider>
            <InventoryProvider>
                <TransactionsProvider>
                    <CartProvider>
                        <ClientProvider>
                            <ModalProvider>
                                {children}
                            </ModalProvider>
                        </ClientProvider>
                    </CartProvider>
                </TransactionsProvider>
            </InventoryProvider>
        </UsersProvider>
    )
}

export default Providers;
