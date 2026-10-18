import type { CommandContext, CommandDef } from './types';
import { findItemByName, parseNameAndAmount, printItemDetails } from '../consoleUtils';

export const inventoryCommands = ({ print, items, refillItem }: CommandContext): CommandDef[] => [
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
        prefixes: ['show item ', 'view item '],
        usage: 'show item <name>',
        description: 'Show details for an item',
        handler: (arg) => {
            const item = findItemByName(items, arg);
            if (!item) return print(`No item found matching "${arg}".`, 'error');
            printItemDetails(print, item);
        },
    },
    {
        prefixes: ['inventory refill '],
        usage: 'inventory refill <name> <amount>',
        description: 'Add stock to an item',
        handler: async (arg) => {
            const parsed = parseNameAndAmount(arg);
            if (!parsed) return print('Usage: inventory refill <name> <amount>', 'error');

            const item = findItemByName(items, parsed.name);
            if (!item) return print(`No item found matching "${parsed.name}".`, 'error');

            const ok = await refillItem(item.id, parsed.amount);
            if (ok) print(`Refilled ${item.name} by ${parsed.amount}.`);
            else print(`Failed to refill ${item.name}.`, 'error');
        },
    },
];
