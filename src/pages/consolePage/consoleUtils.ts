import type { CommandContext } from './commands/types';

type Print = CommandContext['print'];

export const parseNameAndAmount = (arg: string): { name: string; amount: number } | null => {
    const parts = arg.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) return null;

    const amountStr = parts.pop()!;
    const name = parts.join(' ');
    const amount = Number(amountStr);

    return (!name || Number.isNaN(amount)) ? null : { name, amount };
};

// Strips emoji and whitespace so "Göken 🐦" becomes a plausible filename "Göken".
// The .txt extension is purely cosmetic - added when displaying, stripped when reading.
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;
export const sanitizeFilename = (name: string): string => name.replace(EMOJI_REGEX, '').replace(/\s+/g, '');
export const stripTxtExtension = (name: string): string => name.replace(/\.txt$/i, '');

export const findItemByName = (items: Item[], name: string): Item | undefined => {
    const needle = name.toLowerCase();
    return items.find((item) => item.name.toLowerCase() === needle)
        ?? items.find((item) => item.name.toLowerCase().includes(needle));
};

export const findUserByName = (users: User[], name: string): User | undefined => {
    const needle = name.toLowerCase();
    const names = (user: User) => [user.nick.toLowerCase(), user.name.toLowerCase()];
    return users.find((user) => names(user).includes(needle))
        ?? users.find((user) => names(user).some((n) => n.includes(needle)));
};

export const printItemDetails = (print: Print, item: Item) => {
    print(`Name:      ${item.name}`);
    print(`Price:     ${item.internalPrice} kr`);
    print(`Stock:     ${item.amountInStock} st`);
    print(`Favorite:  ${item.favorite ? 'yes' : 'no'}`);
    print(`Available: ${item.available ? 'yes' : 'no'}`);
};

export const printUserDetails = (print: Print, user: User) => {
    print(`Name:    ${user.name}`);
    print(`Nick:    ${user.nick}`);
    print(`Balance: ${user.balance} kr`);
};
