import { InventoryProvider } from './contexts/InventoryContext';
import { CartProvider } from './contexts/CartContext';
import { UsersProvider } from './contexts/UsersContext';
import { PurchasesProvider } from './contexts/PurchasesContext';

const Providers: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
        <InventoryProvider>
            <CartProvider>
                <UsersProvider>
                    <PurchasesProvider>
                        {children}
                    </PurchasesProvider>
                </UsersProvider>
            </CartProvider>
        </InventoryProvider>
    )
}

export default Providers;
