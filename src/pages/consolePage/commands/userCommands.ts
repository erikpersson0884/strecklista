import type { CommandContext, CommandDef } from './types';
import { findUserByName, parseNameAndAmount, printUserDetails } from '../consoleUtils';

export const userCommands = ({ print, users, addUserBalance, currentUser }: CommandContext): CommandDef[] => [
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
        prefixes: ['user info '],
        usage: 'user info <name>',
        description: "Show a user's nick, name, and balance",
        handler: (arg) => {
            const user = findUserByName(users, arg);
            if (!user) return print(`No user found matching "${arg}".`, 'error');
            printUserDetails(print, user);
        },
    },
    {
        prefixes: ['user refill '],
        usage: 'user refill <name> <amount>',
        description: "Deposit an amount to a user's balance",
        handler: async (arg) => {
            const parsed = parseNameAndAmount(arg);
            if (!parsed) return print('Usage: user refill <name> <amount>', 'error');

            const user = findUserByName(users, parsed.name);
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
];
