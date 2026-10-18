import type { CommandContext, CommandDef } from './types';
import {
    findItemByName, findUserByName, printItemDetails, printUserDetails,
    sanitizeFilename, stripTxtExtension,
} from '../consoleUtils';

export const navigationCommands = (ctx: CommandContext): CommandDef[] => {
    const { print, cwd, setCwd, items, users } = ctx;

    return [
        {
            prefixes: ['clear', 'c'],
            usage: 'clear',
            description: 'Clear the console',
            handler: () => ctx.clear(),
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
                    const item = findItemByName(items, name);
                    if (!item) return print(`cat: ${arg}: No such file or directory`, 'error');
                    return printItemDetails(print, item);
                }

                if (cwd === 'users') {
                    const user = findUserByName(users, name);
                    if (!user) return print(`cat: ${arg}: No such file or directory`, 'error');
                    return printUserDetails(print, user);
                }

                // At root, there are no files - only the items/ and users/ directories.
                print(`cat: ${arg}: No such file or directory`, 'error');
            },
        },
        {
            prefixes: ['exit', 'quit'],
            usage: 'exit',
            description: 'Exit the console (does nothing here - just for the bit)',
            handler: () => print('Exiting console...'),
        },
    ];
};
