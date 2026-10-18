import type { CommandContext, CommandDef } from './types';
import { navigationCommands } from './navigationCommands';
import { inventoryCommands } from './inventoryCommands';
import { userCommands } from './userCommands';
import { cartCommands } from './cartCommands';
import { funCommands } from './funCommands';

export const helpLines = (commands: CommandDef[]): string[] => [
    'Available commands:',
    ...commands
        .filter((cmd) => cmd.usage && cmd.description)
        .map((cmd) => `  ${cmd.usage!.padEnd(35)} ${cmd.description}`),
];

export const buildCommands = (ctx: CommandContext): CommandDef[] => {
    const commands: CommandDef[] = [];

    // help lists every command, including itself, so it reads the array lazily.
    const help: CommandDef = {
        prefixes: ['help', 'h', '?'],
        usage: 'help',
        description: 'Show this help text',
        handler: () => helpLines(commands).forEach((line) => ctx.print(line, 'info')),
    };

    commands.push(
        help,
        ...navigationCommands(ctx),
        ...inventoryCommands(ctx),
        ...userCommands(ctx),
        ...cartCommands(ctx),
        ...funCommands(ctx),
    );

    return commands;
};

export const matchCommand = (
    commands: CommandDef[],
    input: string
): { cmd: CommandDef; arg: string } | null => {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();

    for (const cmd of commands) {
        for (const prefix of cmd.prefixes) {
            const takesArg = prefix.endsWith(' ');
            const matches = takesArg ? lower.startsWith(prefix) : lower === prefix;
            if (matches) return { cmd, arg: takesArg ? trimmed.slice(prefix.length).trim() : '' };
        }
    }

    return null;
};
