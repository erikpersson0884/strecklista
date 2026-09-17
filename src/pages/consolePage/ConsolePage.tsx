import { FC, useState, useRef, useEffect } from 'react';
import './ConsolePage.css';

import useInventoryContext from '@/contexts/InventoryContext';
import useUsersContext from '@/contexts/UsersContext';
import useAuthContext from '@/contexts/AuthContext';
import useCartContext from '@/contexts/CartContext';

interface OutputLine {
    text: string;
    type: 'input' | 'success' | 'error' | 'info';
}

type Cwd = '/' | 'items' | 'users';

// A "prefix" ending in a space consumes the rest of the line as an argument
// (e.g. 'show item ' -> "show item Kaffe" gives arg "Kaffe"). A prefix with
// no trailing space must match the whole line exactly, with no argument.
interface CommandDef {
    prefixes: string[];
    usage?: string;
    description?: string;
    handler: (arg: string) => void | Promise<void>;
}

const parseNameAndAmount = (arg: string): { name: string; amount: number } | null => {
    const parts = arg.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return null;

    const amountStr = parts.pop()!;
    const name = parts.join(' ');
    const amount = Number(amountStr);

    return (!name || isNaN(amount)) ? null : { name, amount };
};

// Strips emoji and whitespace so "Göken 🐦" becomes a plausible filename "Göken".
// The .txt extension is purely cosmetic - added when displaying, stripped when reading.
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
const sanitizeFilename = (name: string): string => name.replace(EMOJI_REGEX, '').replace(/\s+/g, '');
const stripTxtExtension = (name: string): string => name.replace(/\.txt$/i, '');

const ConsolePage: FC = () => {
    const { items, refillItem } = useInventoryContext();
    const { users, addUserBalance } = useUsersContext();
    const { currentUser } = useAuthContext();
    const { addItemToCart, setPayingUser, payingUser, purchaseCart, emptyCart, itemsInCart } = useCartContext();

    const [command, setCommand] = useState<string>('');
    const [output, setOutput] = useState<OutputLine[]>([
        { text: "Strecklista Console - Type 'help' for available commands.", type: 'info' },
    ]);
    const [cwd, setCwd] = useState<Cwd>('/');

    // Up/down arrow history, like a real shell.
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number | null>(null);

    const outputRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keep the view pinned to the newest line (including the live prompt) as output grows.
    useEffect(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
    }, [output]);

    const print = (text: string, type: OutputLine['type'] = 'success') => {
        setOutput((prev) => [...prev, { text, type }]);
    };

    const findItemByName = (name: string): Item | undefined =>
        items.find((item) => item.name.toLowerCase() === name.toLowerCase())
        ?? items.find((item) => item.name.toLowerCase().includes(name.toLowerCase()));

    const findUserByName = (name: string): User | undefined =>
        users.find((user) => user.nick.toLowerCase() === name.toLowerCase() || user.name.toLowerCase() === name.toLowerCase())
        ?? users.find((user) => user.nick.toLowerCase().includes(name.toLowerCase()) || user.name.toLowerCase().includes(name.toLowerCase()));

    const printItemDetails = (item: Item) => {
        print(`Name:      ${item.name}`);
        print(`Price:     ${item.internalPrice} kr`);
        print(`Stock:     ${item.amountInStock} st`);
        print(`Favorite:  ${item.favorite ? 'yes' : 'no'}`);
        print(`Available: ${item.available ? 'yes' : 'no'}`);
    };

    const printUserDetails = (user: User) => {
        print(`Name:    ${user.name}`);
        print(`Nick:    ${user.nick}`);
        print(`Balance: ${user.balance} kr`);
    };

    const CART_HELP_LINES = [
        'Cart commands:',
        '  cart add <item>          Add an item to the cart',
        '  cart set user <name>     Set the paying user for the cart',
        '  cart purchase            Purchase the items in the cart for the paying user',
        '  cart empty               Empty the cart',
        '  cart show                Show the items in the cart',
    ];

    const COMMANDS: CommandDef[] = [
        {
            prefixes: ['help', 'h', '?'],
            usage: 'help',
            description: 'Show this help text',
            handler: () => HELP_TEXT.forEach((line) => print(line, 'info')),
        },
        {
            prefixes: ['clear', 'c'],
            usage: 'clear',
            description: 'Clear the console',
            handler: () => setOutput([]),
        },
        {
            prefixes: ['pwd'],
            usage: 'pwd',
            description: 'Print the current directory',
            handler: () => print(cwd === '/' ? '/' : `/${cwd}`),
        },
        {
            prefixes: ['cd ', 'cd'],
            usage: 'cd <directory>',
            description: 'Change directory',
            handler: (arg) => {
                const target = arg.trim().toLowerCase();

                if (target === '' || target === '/' || target === '~' || target === '..') return setCwd('/');
                if (target === 'items') return setCwd('items');
                if (target === 'users') return setCwd('users');

                print(`cd: no such directory: ${arg}`, 'error');
            },
        },
        {
            prefixes: ['ls'],
            usage: 'ls',
            description: 'List the contents of the current directory',
            handler: () => {
                if (cwd === '/') {
                    print('items/');
                    print('users/');
                    return;
                }

                if (cwd === 'items') {
                    if (items.length === 0) return print('(empty)', 'info');
                    items.forEach((item) => print(`${sanitizeFilename(item.name)}.txt`));
                    return;
                }

                if (users.length === 0) return print('(empty)', 'info');
                users.forEach((user) => print(`${sanitizeFilename(user.nick)}.txt`));
            },
        },
        {
            prefixes: ['cat '],
            usage: 'cat <file>',
            description: 'Print the contents of a file - only works inside items/ or users/',
            handler: (arg) => {
                const name = stripTxtExtension(arg.trim());

                if (cwd === 'items') {
                    const item = findItemByName(name);
                    if (!item) return print(`cat: ${arg}: No such file or directory`, 'error');
                    return printItemDetails(item);
                }

                if (cwd === 'users') {
                    const user = findUserByName(name);
                    if (!user) return print(`cat: ${arg}: No such file or directory`, 'error');
                    return printUserDetails(user);
                }

                // At root, there are no files - only the items/ and users/ directories.
                print(`cat: ${arg}: No such file or directory`, 'error');
            },
        },
        {
            prefixes:['git status'],
            handler: () => {
                print('On branch main');
                print('Your branch is up to date with \'origin/main\'.');
                print('');
                print('nothing to commit, working tree clean');
                print('(You should really not be using git in this console, a strecklista should be private, but here we are.)');
            }
        },
        {
            prefixes: ['göken'],
            handler: () => {
                print('Ja, du hittade mig, grattis! 🐦');
                print('Men tyvärr, det finns ingen hemlig funktion här. Det är bara en påminnelse om att det inte går att bli av med mig så lätt. Jag har ett finger med i spelet i det mesta som händer. Och jag kommer alltid att finnas här, gömd i koden. 🐦');
            }
        },
        {
            prefixes: ['inventory list', 'list items', 'list inventory', 'view items', 'inventory show'],
            usage: 'inventory list',
            description: 'List all items and their stock',
            handler: () => {
                if (items.length === 0) return print('No items in inventory.', 'error');
                items.forEach((item) => print(`  ${item.name.padEnd(20)} ${item.amountInStock} st`));
            },
        },
        {
            prefixes: ['user list', 'list users', 'list people', 'list persons', 'view users'],
            usage: 'user list',
            description: 'List all users and their balance',
            handler: () => {
                if (users.length === 0) return print('No users found.', 'error');
                users.forEach((user) => print(`  ${user.nick.padEnd(20)} ${user.balance} kr`));
            },
        },
        {
            prefixes: ['show item ', 'view item '],
            usage: 'show item <name>',
            description: 'Show details for an item',
            handler: (arg) => {
                const item = findItemByName(arg);
                if (!item) return print(`No item found matching "${arg}".`, 'error');
                printItemDetails(item);
            },
        },
        {
            prefixes: ['inventory refill '],
            usage: 'inventory refill <name> <amount>',
            description: 'Add stock to an item',
            handler: async (arg) => {
                const parsed = parseNameAndAmount(arg);
                if (!parsed) return print('Usage: inventory refill <name> <amount>', 'error');

                const item = findItemByName(parsed.name);
                if (!item) return print(`No item found matching "${parsed.name}".`, 'error');

                const ok = await refillItem(item.id, parsed.amount);
                if (ok) print(`Refilled ${item.name} by ${parsed.amount}.`);
                else print(`Failed to refill ${item.name}.`, 'error');
            },
        },
        {
            prefixes: ['user info '],
            usage: 'user info <name>',
            description: "Show a user's nick, name, and balance",
            handler: (arg) => {
                const user = findUserByName(arg);
                if (!user) return print(`No user found matching "${arg}".`, 'error');
                printUserDetails(user);
            },
        },
        {
            prefixes: ['user refill '],
            usage: 'user refill <name> <amount>',
            description: "Deposit an amount to a user's balance",
            handler: async (arg) => {
                const parsed = parseNameAndAmount(arg);
                if (!parsed) return print('Usage: user refill <name> <amount>', 'error');

                const user = findUserByName(parsed.name);
                if (!user) return print(`No user found matching "${parsed.name}".`, 'error');

                const ok = await addUserBalance(user.id, parsed.amount);
                if (ok) print(`Deposited ${parsed.amount} kr to ${user.nick}.`);
                else print(`Failed to deposit to ${user.nick}.`, 'error');
            },
        },
        {
            prefixes: ['whoami', 'who am i', 'current user', 'me', 'who'],
            usage: 'whoami',
            description: 'Show the currently logged in user',
            handler: () => print(currentUser?.nick || currentUser?.name || 'Unknown user'),
        },
        {
            prefixes: ['exit', 'quit'],
            usage: 'exit',
            description: 'Exit the console (does nothing here - just for the bit)',
            handler: () => print('Exiting console...'),
        },
        {
            prefixes: ['cart add '],
            usage: 'cart add <item>',
            description: 'Add an item to the cart',
            handler: (arg) => {
                const item = findItemByName(arg);
                if (!item) return print(`No item found matching "${arg}".`, 'error');
                if (!item.available) return print(`Item "${item.name}" is not available for purchase.`, 'error');

                addItemToCart(item);
                print(`Added ${item.name} to cart.`);
            },
        },
        {
            prefixes: ['cart set user '],
            usage: 'cart set user <name>',
            description: 'Set the paying user for the cart',
            handler: (arg) => {
                const user = findUserByName(arg);
                if (!user) return print(`No user found matching "${arg}".`, 'error');

                setPayingUser(user);
                print(`Set paying user to ${user.nick}.`);
            },
        },
        {
            prefixes: ['cart purchase', 'cart checkout'],
            usage: 'cart purchase',
            description: 'Purchase the items in the cart for the paying user',
            handler: async () => {
                if (!payingUser) return print('No paying user set. Use "cart set user <name>" to set one.', 'error');

                const wasSuccessful = await purchaseCart();
                if (wasSuccessful) {
                    print(`Purchase successful for ${payingUser.nick}.`);
                    print('User balance is now: ' + payingUser.balance + ' kr');
                } else print(`Purchase failed for ${payingUser.nick}.`, 'error');
            },
        },
        {
            prefixes: ['cart empty', 'cart clear', 'cart reset', 'cart remove all', 'empty cart'],
            usage: 'cart empty',
            description: 'Empty the cart',
            handler: () => {
                emptyCart();
                print('Cart emptied.');
            },
        },
        {
            prefixes: ['cart show', 'cart view', 'cart list'],
            usage: 'cart show',
            description: 'Show the items in the cart',
            handler: () => {
                if (!payingUser) return print('No paying user set. Use "cart set user <name>" to set one.', 'error');
                if (itemsInCart.length === 0) return print('Cart is empty.', 'error');

                print(`Cart for ${payingUser.nick}:`);
                itemsInCart.forEach((item) => print(`  ${item.name.padEnd(20)} ${item.quantity} st`));
            },
        },
        {
            prefixes: ['cart show paying user', 'cart view paying user', 'cart who pays', 'cart paying user'],
            usage: 'cart paying user',
            description: 'Show the current paying user for the cart',
            handler: () => {
                if (!payingUser) return print('No paying user set. Use "cart set user <name>" to set one.', 'error');
                print(`Paying user: ${payingUser.nick}`);
            },
        },
        {
            prefixes: ['cart help', 'cart commands'],
            usage: 'cart help',
            description: 'List cart-related commands',
            handler: () => CART_HELP_LINES.forEach((line) => print(line, 'info')),
        },
    ];

    const availableCommand: CommandDef[] = COMMANDS.filter((cmd) => cmd.usage && cmd.description);

    const HELP_TEXT = [
        'Available commands:',
        ...availableCommand.map((cmd) => `  ${cmd.usage?.padEnd(35) ?? ''.padEnd(35)} ${cmd.description}`),
    ];

    const handleCommand = async (rawCommand: string) => {
        const trimmed = rawCommand.trim();
        print(rawCommand, 'input');
        if (!trimmed) return;

        const lower = trimmed.toLowerCase();

        for (const cmd of COMMANDS) {
            for (const prefix of cmd.prefixes) {
                const takesArg = prefix.endsWith(' ');
                const matches = takesArg ? lower.startsWith(prefix) : lower === prefix;
                if (!matches) continue;

                const arg = takesArg ? trimmed.slice(prefix.length).trim() : '';
                await cmd.handler(arg);
                return;
            }
        }

        print(`Command not found: "${trimmed}". Type 'help' for available commands.`, 'error');
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (command.trim()) setCommandHistory((prev) => [...prev, command]);
            handleCommand(command);
            setCommand('');
            setHistoryIndex(null);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length === 0) return;
            const nextIndex = historyIndex === null ? commandHistory.length - 1 : Math.max(historyIndex - 1, 0);
            setHistoryIndex(nextIndex);
            setCommand(commandHistory[nextIndex]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex === null) return;
            const nextIndex = historyIndex + 1;
            if (nextIndex >= commandHistory.length) {
                setHistoryIndex(null);
                setCommand('');
            } else {
                setHistoryIndex(nextIndex);
                setCommand(commandHistory[nextIndex]);
            }
        }
    };

    const promptLabel = cwd === '/' ? '/' : `/${cwd}`;

    return (
        <div className="console-page page">
            <div className="console-output" ref={outputRef} onClick={() => inputRef.current?.focus()}>
                {output.map((line, index) => (
                    line.type === 'input'
                        ? <p key={index} className="console-line console-line-input"><span className="console-prompt">&gt;</span> {line.text}</p>
                        : <p key={index} className={`console-line console-line-${line.type}`}>{line.text}</p>
                ))}

                {/* The live prompt lives inside the scroll buffer, like a real terminal - not in a separate box below it. */}
                <div className="console-input-row">
                    <span className="console-prompt">IT:{promptLabel} &gt;</span>
                    <input
                        ref={inputRef}
                        type="text"
                        autoFocus
                        autoComplete="off"
                        spellCheck={false}
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
            </div>
        </div>
    );
}

export default ConsolePage;