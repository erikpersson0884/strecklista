import { InventoryProvider } from './Contexts/InventoryContext';
import { CartProvider } from './Contexts/CartContext';
import { UsersProvider } from './Contexts/UsersContext';
import { AuthProvider } from './Contexts/AuthContext';
import { PurchasesProvider } from './Contexts/PurchasesContext';

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
