import type useInventoryContext from '@/contexts/InventoryContext';
import type useUsersContext from '@/contexts/UsersContext';
import type useAuthContext from '@/contexts/AuthContext';
import type useCartContext from '@/contexts/CartContext';

export interface OutputLine {
    text: string;
    type: 'input' | 'success' | 'error' | 'info';
}

export type Cwd = '/' | 'items' | 'users';

// A "prefix" ending in a space consumes the rest of the line as an argument
// (e.g. 'show item ' -> "show item Kaffe" gives arg "Kaffe"). A prefix with
// no trailing space must match the whole line exactly, with no argument.
export interface CommandDef {
    prefixes: string[];
    usage?: string;
    description?: string;
    handler: (arg: string) => void | Promise<void>;
}

type InventoryApi = ReturnType<typeof useInventoryContext>;
type UsersApi = ReturnType<typeof useUsersContext>;
type AuthApi = ReturnType<typeof useAuthContext>;
type CartApi = ReturnType<typeof useCartContext>;

/** Everything a command is allowed to read or do. Built by useConsole. */
export interface CommandContext
    extends Pick<InventoryApi, 'items' | 'refillItem'>,
        Pick<UsersApi, 'users' | 'addUserBalance'> {
    print: (text: string, type?: OutputLine['type']) => void;
    clear: () => void;
    cwd: Cwd;
    setCwd: (cwd: Cwd) => void;
    currentUser: AuthApi['currentUser'];
    cart: Pick<
        CartApi,
        'addItemToCart' | 'setPayingUser' | 'payingUser' | 'purchaseCart' | 'emptyCart' | 'itemsInCart'
    >;
}
