import { InventoryProvider } from './InventoryContext';
import { CartProvider } from './CartContext';
import { UsersProvider } from './UsersContext';
import { TransactionsProvider } from './TransactionsContext';
import { ModalProvider } from './ModalContext';
import { ClientProvider } from './ClientContext';
import { NotificationProvider } from './NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TransactionRefreshProvider } from './TransactionRefreshContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <NotificationProvider>
            <AuthProvider>
                <TransactionRefreshProvider>
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
                </TransactionRefreshProvider>
            </AuthProvider>
        </NotificationProvider>
    )
}

export default Providers;
