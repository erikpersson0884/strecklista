import type { CommandContext, CommandDef } from './types';
import { findItemByName, findUserByName } from '../consoleUtils';

const NO_PAYING_USER = 'No paying user set. Use "cart set user <name>" to set one.';

const CART_HELP_LINES = [
    'Cart commands:',
    '  cart add <item>          Add an item to the cart',
    '  cart set user <name>     Set the paying user for the cart',
    '  cart purchase            Purchase the items in the cart for the paying user',
    '  cart empty               Empty the cart',
    '  cart show                Show the items in the cart',
];

export const cartCommands = ({ print, items, users, cart }: CommandContext): CommandDef[] => {
    const { addItemToCart, setPayingUser, payingUser, purchaseCart, emptyCart, itemsInCart } = cart;

    return [
        {
            prefixes: ['cart add '],
            usage: 'cart add <item>',
            description: 'Add an item to the cart',
            handler: (arg) => {
                const item = findItemByName(items, arg);
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
                const user = findUserByName(users, arg);
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
                if (!payingUser) return print(NO_PAYING_USER, 'error');

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
                if (!payingUser) return print(NO_PAYING_USER, 'error');
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
                if (!payingUser) return print(NO_PAYING_USER, 'error');
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
};
