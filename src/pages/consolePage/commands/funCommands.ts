import type { CommandContext, CommandDef } from './types';

export const funCommands = ({ print }: CommandContext): CommandDef[] => [
    {
        prefixes: ['git status'],
        handler: () => {
            print('On branch main');
            print("Your branch is up to date with 'origin/main'.");
            print('');
            print('nothing to commit, working tree clean');
            print('(You should really not be using git in this console, a strecklista should be private, but here we are.)');
        },
    },
    {
        prefixes: ['göken'],
        handler: () => {
            print('Ja, du hittade mig, grattis! 🐦');
            print('Men tyvärr, det finns ingen hemlig funktion här. Det är bara en påminnelse om att det inte går att bli av med mig så lätt. Jag har ett finger med i spelet i det mesta som händer. Och jag kommer alltid att finnas här, gömd i koden. 🐦');
        },
    },
];
