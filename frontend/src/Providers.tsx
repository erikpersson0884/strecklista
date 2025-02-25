import { InventoryProvider } from './contexts/InventoryContext';
import { CartProvider } from './contexts/CartContext';
import { UsersProvider } from './contexts/UsersContext';
import { AuthProvider } from './contexts/AuthContext';
import { PurchasesProvider } from './contexts/PurchasesContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <AuthProvider>
            <InventoryProvider>
                <CartProvider>
                    <UsersProvider>
                        <PurchasesProvider>
                            {children}
                        </PurchasesProvider>
                    </UsersProvider>
                </CartProvider>
            </InventoryProvider>
        </AuthProvider>
    )
}

export default Providers;
