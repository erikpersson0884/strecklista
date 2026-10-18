import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import useInventoryContext from '@/contexts/InventoryContext';
import useUsersContext from '@/contexts/UsersContext';
import useAuthContext from '@/contexts/AuthContext';
import useCartContext from '@/contexts/CartContext';

import { buildCommands, matchCommand } from './commands';
import type { CommandContext, Cwd, OutputLine } from './commands/types';

export function useConsole() {
    const { items, refillItem } = useInventoryContext();
    const { users, addUserBalance } = useUsersContext();
    const { currentUser } = useAuthContext();
    const cart = useCartContext();

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

    // The input is the whole point of this page, so focus it when the page opens.
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Keep the view pinned to the newest line (including the live prompt) as output grows.
    useEffect(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
    }, [output]);

    const print: CommandContext['print'] = (text, type = 'success') => {
        setOutput((prev) => [...prev, { text, type }]);
    };

    const commands = buildCommands({
        print,
        clear: () => setOutput([]),
        cwd,
        setCwd,
        items,
        refillItem,
        users,
        addUserBalance,
        currentUser,
        cart,
    });

    const handleCommand = async (rawCommand: string) => {
        const trimmed = rawCommand.trim();
        print(rawCommand, 'input');
        if (!trimmed) return;

        const match = matchCommand(commands, trimmed);
        if (!match) {
            print(`Command not found: "${trimmed}". Type 'help' for available commands.`, 'error');
            return;
        }

        await match.cmd.handler(match.arg);
    };

    const onKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (command.trim()) setCommandHistory((prev) => [...prev, command]);
            await handleCommand(command);
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

    return {
        output,
        command,
        setCommand,
        promptLabel: cwd === '/' ? '/' : `/${cwd}`,
        onKeyDown,
        outputRef,
        inputRef,
    };
}
