// src/tests/pages/ConsolePage.test.tsx
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

import ConsolePage from '@/pages/consolePage/ConsolePage'; // adjust path
import useInventoryContext from '@/contexts/InventoryContext';
import useUsersContext from '@/contexts/UsersContext';
import useAuthContext from '@/contexts/AuthContext';
import useCartContext from '@/contexts/CartContext';

vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ default: vi.fn() }));

// ---------- test data ----------
const lask = { id: 'i1', name: 'Läsk', internalPrice: 12, amountInStock: 5, favorite: true, available: true };
const kaffe = { id: 'i2', name: 'Kaffe', internalPrice: 8, amountInStock: 0, favorite: false, available: false };
const alice = { id: 'u1', nick: 'Alice', name: 'Alice Andersson', balance: 100 };
const bob = { id: 'u2', nick: 'Bob', name: 'Robert Bengtsson', balance: -20 };

const item = (over: Record<string, unknown>) => ({ ...lask, ...over });
const user = (over: Record<string, unknown>) => ({ ...alice, ...over });

type Overrides = {
  inventory?: Record<string, unknown>;
  users?: Record<string, unknown>;
  auth?: Record<string, unknown>;
  cart?: Record<string, unknown>;
};

function setup(o: Overrides = {}) {
  const inventory = {
    items: [lask, kaffe],
    refillItem: vi.fn().mockResolvedValue(true),
    ...o.inventory,
  };
  const users = {
    users: [alice, bob],
    addUserBalance: vi.fn().mockResolvedValue(true),
    ...o.users,
  };
  const auth = { currentUser: alice, ...o.auth };
  const cart = {
    addItemToCart: vi.fn(),
    setPayingUser: vi.fn(),
    payingUser: alice,
    purchaseCart: vi.fn().mockResolvedValue(true),
    emptyCart: vi.fn(),
    itemsInCart: [],
    ...o.cart,
  };

  vi.mocked(useInventoryContext).mockReturnValue(inventory as any);
  vi.mocked(useUsersContext).mockReturnValue(users as any);
  vi.mocked(useAuthContext).mockReturnValue(auth as any);
  vi.mocked(useCartContext).mockReturnValue(cart as any);

  render(<ConsolePage />);
  return { inventory, users, auth, cart };
}

// ---------- helpers ----------
const input = () => screen.getByRole('textbox') as HTMLInputElement;
const run = async (command: string) => {
  await userEvent.type(input(), `${command}{Enter}`);
};

const normalize = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const lineEls = () => Array.from(document.querySelectorAll<HTMLElement>('.console-line'));
const lines = () => lineEls().map((l) => normalize(l.textContent));
const out = () => lines().slice(1); // everything after the welcome line

const lineOf = (text: string) => {
  const el = lineEls().find((l) => normalize(l.textContent) === text);
  if (!el) throw new Error(`No console line "${text}". Lines: ${JSON.stringify(lines())}`);
  return el;
};
const findLine = (text: string) => waitFor(() => lineOf(text)); // for async handlers

const scrollTo = vi.fn();

beforeAll(() => {
  // jsdom does not implement Element.scrollTo
  Element.prototype.scrollTo = scrollTo as unknown as typeof Element.prototype.scrollTo;
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('ConsolePage', () => {
  describe('rendering', () => {
    it('shows the welcome message as an info line', () => {
      setup();
      expect(lineOf("Strecklista Console - Type 'help' for available commands.")).toHaveClass('console-line-info');
    });

    it('focuses the input on mount', () => {
      setup();
      expect(input()).toHaveFocus();
    });

    it('turns off autocomplete and spellcheck on the input', () => {
      setup();
      expect(input()).toHaveAttribute('autocomplete', 'off');
      expect(input()).toHaveAttribute('spellcheck', 'false');
    });

    it('shows the root prompt', () => {
      setup();
      expect(screen.getByText('IT:/ >')).toBeInTheDocument();
    });

    it('focuses the input when the output area is clicked', async () => {
      setup();
      input().blur();
      expect(input()).not.toHaveFocus();

      await userEvent.click(document.querySelector('.console-output')!);
      expect(input()).toHaveFocus();
    });

    it('scrolls the output to the bottom as it grows', async () => {
      setup();
      scrollTo.mockClear();
      await run('pwd');
      expect(scrollTo).toHaveBeenCalledWith({ top: expect.any(Number) });
    });
  });

  describe('entering commands', () => {
    it('updates the input as the user types, without running anything', async () => {
      setup();
      await userEvent.type(input(), 'pwd');
      expect(input()).toHaveValue('pwd');
      expect(out()).toEqual([]);
    });

    it('echoes the command as an input line and clears the input', async () => {
      setup();
      await run('pwd');
      expect(lineOf('> pwd')).toHaveClass('console-line-input');
      expect(input()).toHaveValue('');
    });

    it.each(['', '   '])('echoes an empty command "%s" without running anything', async (command) => {
      setup();
      await run(command);
      expect(out()).toEqual(['>']);
    });

    it('reports an unknown command as an error, using the trimmed text', async () => {
      setup();
      await run('  Foo  ');
      expect(lineOf(`Command not found: "Foo". Type 'help' for available commands.`)).toHaveClass('console-line-error');
    });

    it('matches commands case-insensitively and keeps the argument case', async () => {
      const { cart } = setup();
      await run('CART ADD LÄSK');
      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
    });

    it.each(['cat', 'show item', 'inventory refill', 'cart add', 'ls items'])(
      'does not treat "%s" without its argument or with extras as a command',
      async (command) => {
        setup();
        await run(command);
        expect(out()[1]).toMatch(/^Command not found/);
      }
    );
  });

  describe('help and clear', () => {
    it.each(['help', 'h', '?'])('prints the command list for "%s"', async (command) => {
      setup();
      await run(command);

      expect(lineOf('Available commands:')).toHaveClass('console-line-info');
      expect(lines()).toContain('help Show this help text');
      expect(lines()).toContain('cd <directory> Change directory');
      expect(lines()).toContain('cart paying user Show the current paying user for the cart');
    });

    it('does not list the hidden commands', async () => {
      setup();
      await run('help');
      expect(lines().some((l) => l.includes('git status'))).toBe(false);
      expect(lines().some((l) => l.includes('göken'))).toBe(false);
    });

    it.each(['clear', 'c'])('clears the console with "%s"', async (command) => {
      setup();
      await run('pwd');
      await run(command);
      expect(lines()).toEqual([]);
      expect(input()).toBeInTheDocument(); // the prompt survives
    });
  });

  describe('navigation', () => {
    it('prints the current directory', async () => {
      setup();
      await run('pwd');
      expect(out()).toEqual(['> pwd', '/']);

      await run('cd items');
      await run('pwd');
      expect(lines().at(-1)).toBe('/items');
    });

    it('changes directory and updates the prompt', async () => {
      setup();
      await run('cd items');
      expect(screen.getByText('IT:/items >')).toBeInTheDocument();

      await run('cd users');
      expect(screen.getByText('IT:/users >')).toBeInTheDocument();
    });

    it('ignores case in the directory name', async () => {
      setup();
      await run('CD Items');
      expect(screen.getByText('IT:/items >')).toBeInTheDocument();
    });

    it.each(['cd /', 'cd ~', 'cd ..', 'cd'])('returns to the root with "%s"', async (command) => {
      setup();
      await run('cd items');
      await run(command);
      expect(screen.getByText('IT:/ >')).toBeInTheDocument();
    });

    it('reports an unknown directory and stays put', async () => {
      setup();
      await run('cd nowhere');
      expect(lineOf('cd: no such directory: nowhere')).toHaveClass('console-line-error');
      expect(screen.getByText('IT:/ >')).toBeInTheDocument();
    });
  });

  describe('ls', () => {
    it('lists the directories at the root', async () => {
      setup();
      await run('ls');
      expect(out()).toEqual(['> ls', 'items/', 'users/']);
    });

    it('lists items as .txt files', async () => {
      setup();
      await run('cd items');
      await run('ls');
      expect(out().slice(-2)).toEqual(['Läsk.txt', 'Kaffe.txt']);
    });

    it('lists users by nick as .txt files', async () => {
      setup();
      await run('cd users');
      await run('ls');
      expect(out().slice(-2)).toEqual(['Alice.txt', 'Bob.txt']);
    });

    it('strips spaces and emoji from file names', async () => {
      setup({ inventory: { items: [item({ name: 'Göken 🐦' }), item({ id: 'i3', name: 'Red Bull' })] } });
      await run('cd items');
      await run('ls');
      expect(out().slice(-2)).toEqual(['Göken.txt', 'RedBull.txt']);
    });

    it('shows (empty) for an empty items directory', async () => {
      setup({ inventory: { items: [] } });
      await run('cd items');
      await run('ls');
      expect(lineOf('(empty)')).toHaveClass('console-line-info');
    });

    it('shows (empty) for an empty users directory', async () => {
      setup({ users: { users: [] } });
      await run('cd users');
      await run('ls');
      expect(lineOf('(empty)')).toHaveClass('console-line-info');
    });
  });

  describe('cat', () => {
    it('prints an item inside items/', async () => {
      setup();
      await run('cd items');
      await run('cat Läsk');
      expect(out().slice(-5)).toEqual([
        'Name: Läsk',
        'Price: 12 kr',
        'Stock: 5 st',
        'Favorite: yes',
        'Available: yes',
      ]);
    });

    it('shows "no" for a non-favorite, unavailable item', async () => {
      setup();
      await run('cd items');
      await run('cat Kaffe');
      expect(out().slice(-5)).toEqual([
        'Name: Kaffe',
        'Price: 8 kr',
        'Stock: 0 st',
        'Favorite: no',
        'Available: no',
      ]);
    });

    it('ignores case and the .txt extension, and accepts partial names', async () => {
      setup();
      await run('cd items');
      await run('cat läsk.TXT');
      expect(lines()).toContain('Name: Läsk');

      await run('cat kaf');
      expect(lines()).toContain('Name: Kaffe');
    });

    it('prints a user inside users/', async () => {
      setup();
      await run('cd users');
      await run('cat alice.txt');
      expect(out().slice(-3)).toEqual(['Name: Alice Andersson', 'Nick: Alice', 'Balance: 100 kr']);
    });

    it('finds a user by full name', async () => {
      setup();
      await run('cd users');
      await run('cat robert bengtsson');
      expect(lines()).toContain('Nick: Bob');
    });

    it('reports a missing item', async () => {
      setup();
      await run('cd items');
      await run('cat ghost.txt');
      expect(lineOf('cat: ghost.txt: No such file or directory')).toHaveClass('console-line-error');
    });

    it('reports a missing user', async () => {
      setup();
      await run('cd users');
      await run('cat ghost');
      expect(lineOf('cat: ghost: No such file or directory')).toHaveClass('console-line-error');
    });

    it('finds nothing at the root', async () => {
      setup();
      await run('cat Läsk');
      expect(lineOf('cat: Läsk: No such file or directory')).toHaveClass('console-line-error');
    });

    // Fails on the current code (see "ls names can't be cat'ed" below).
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('can cat an item using the file name that ls printed', async () => {
      setup({ inventory: { items: [item({ id: 'i3', name: 'Red Bull' })] } });
      await run('cd items');
      await run('ls');
      expect(lines()).toContain('RedBull.txt');

      await run('cat RedBull.txt');
      expect(lines()).toContain('Name: Red Bull');
    });

    it.fails('can cat a user using the file name that ls printed', async () => {
      setup({ users: { users: [user({ id: 'u3', nick: 'Big Al' })] } });
      await run('cd users');
      await run('cat BigAl.txt');
      expect(lines()).toContain('Nick: Big Al');
    });
  });

  describe('name matching', () => {
    it('prefers an exact name over a partial one', async () => {
      setup({
        inventory: { items: [item({ id: 'a', name: 'Kaffe Latte' }), item({ id: 'b', name: 'Kaffe' })] },
      });
      await run('show item kaffe');
      expect(lines()).toContain('Name: Kaffe');
      expect(lines()).not.toContain('Name: Kaffe Latte');
    });

    it('falls back to the first partial match', async () => {
      setup();
      await run('show item ä');
      expect(lines()).toContain('Name: Läsk');
    });

    it('matches users by nick, full name, and partial name', async () => {
      setup();
      await run('user info alice');
      await run('user info robert bengtsson');
      await run('user info bengt');
      expect(lines().filter((l) => l === 'Nick: Alice')).toHaveLength(1);
      expect(lines().filter((l) => l === 'Nick: Bob')).toHaveLength(2);
    });
  });

  describe('inventory commands', () => {
    it.each(['inventory list', 'list items', 'list inventory', 'view items', 'inventory show'])(
      'lists items and stock with "%s"',
      async (command) => {
        setup();
        await run(command);
        expect(out().slice(-2)).toEqual(['Läsk 5 st', 'Kaffe 0 st']);
      }
    );

    it('reports an empty inventory as an error', async () => {
      setup({ inventory: { items: [] } });
      await run('inventory list');
      expect(lineOf('No items in inventory.')).toHaveClass('console-line-error');
    });

    it.each(['show item läsk', 'view item läsk'])('shows item details with "%s"', async (command) => {
      setup();
      await run(command);
      expect(out().slice(-5)).toEqual([
        'Name: Läsk',
        'Price: 12 kr',
        'Stock: 5 st',
        'Favorite: yes',
        'Available: yes',
      ]);
    });

    it('reports an unknown item', async () => {
      setup();
      await run('show item ghost');
      expect(lineOf('No item found matching "ghost".')).toHaveClass('console-line-error');
    });

    describe('refill', () => {
      it('refills an item and confirms', async () => {
        const { inventory } = setup();
        await run('inventory refill läsk 10');

        expect(await findLine('Refilled Läsk by 10.')).toHaveClass('console-line-success');
        expect(inventory.refillItem).toHaveBeenCalledWith('i1', 10);
      });

      it('handles item names with spaces', async () => {
        const { inventory } = setup({ inventory: { items: [item({ id: 'i3', name: 'Red Bull' })] } });
        await run('inventory refill red bull 4');

        await findLine('Refilled Red Bull by 4.');
        expect(inventory.refillItem).toHaveBeenCalledWith('i3', 4);
      });

      it('reports a failed refill', async () => {
        setup({ inventory: { refillItem: vi.fn().mockResolvedValue(false) } });
        await run('inventory refill läsk 10');
        expect(await findLine('Failed to refill Läsk.')).toHaveClass('console-line-error');
      });

      it.each(['inventory refill läsk', 'inventory refill läsk abc', 'inventory refill 5'])(
        'shows the usage for "%s"',
        async (command) => {
          const { inventory } = setup();
          await run(command);
          expect(lineOf('Usage: inventory refill <name> <amount>')).toHaveClass('console-line-error');
          expect(inventory.refillItem).not.toHaveBeenCalled();
        }
      );

      it('reports an unknown item', async () => {
        const { inventory } = setup();
        await run('inventory refill ghost 5');
        expect(lineOf('No item found matching "ghost".')).toHaveClass('console-line-error');
        expect(inventory.refillItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('user commands', () => {
    it.each(['user list', 'list users', 'list people', 'list persons', 'view users'])(
      'lists users and balances with "%s"',
      async (command) => {
        setup();
        await run(command);
        expect(out().slice(-2)).toEqual(['Alice 100 kr', 'Bob -20 kr']);
      }
    );

    it('reports no users as an error', async () => {
      setup({ users: { users: [] } });
      await run('user list');
      expect(lineOf('No users found.')).toHaveClass('console-line-error');
    });

    it('shows user info', async () => {
      setup();
      await run('user info bob');
      expect(out().slice(-3)).toEqual(['Name: Robert Bengtsson', 'Nick: Bob', 'Balance: -20 kr']);
    });

    it('reports an unknown user for info', async () => {
      setup();
      await run('user info ghost');
      expect(lineOf('No user found matching "ghost".')).toHaveClass('console-line-error');
    });

    describe('refill', () => {
      it('deposits to a user and confirms', async () => {
        const { users } = setup();
        await run('user refill alice 50');

        expect(await findLine('Deposited 50 kr to Alice.')).toHaveClass('console-line-success');
        expect(users.addUserBalance).toHaveBeenCalledWith('u1', 50);
      });

      it('handles full names with spaces', async () => {
        const { users } = setup();
        await run('user refill robert bengtsson 25');

        await findLine('Deposited 25 kr to Bob.');
        expect(users.addUserBalance).toHaveBeenCalledWith('u2', 25);
      });

      it('reports a failed deposit', async () => {
        setup({ users: { addUserBalance: vi.fn().mockResolvedValue(false) } });
        await run('user refill alice 50');
        expect(await findLine('Failed to deposit to Alice.')).toHaveClass('console-line-error');
      });

      it.each(['user refill alice', 'user refill alice abc'])('shows the usage for "%s"', async (command) => {
        const { users } = setup();
        await run(command);
        expect(lineOf('Usage: user refill <name> <amount>')).toHaveClass('console-line-error');
        expect(users.addUserBalance).not.toHaveBeenCalled();
      });

      it('reports an unknown user', async () => {
        const { users } = setup();
        await run('user refill ghost 5');
        expect(lineOf('No user found matching "ghost".')).toHaveClass('console-line-error');
        expect(users.addUserBalance).not.toHaveBeenCalled();
      });
    });
  });

  describe('whoami and exit', () => {
    it.each(['whoami', 'who am i', 'current user', 'me', 'who'])('prints the current user for "%s"', async (command) => {
      setup();
      await run(command);
      expect(lines().at(-1)).toBe('Alice');
    });

    it('falls back to the name when the nick is empty', async () => {
      setup({ auth: { currentUser: { nick: '', name: 'Jane Doe' } } });
      await run('whoami');
      expect(lines().at(-1)).toBe('Jane Doe');
    });

    it('prints "Unknown user" when nobody is logged in', async () => {
      setup({ auth: { currentUser: null } });
      await run('whoami');
      expect(lines().at(-1)).toBe('Unknown user');
    });

    it.each(['exit', 'quit'])('pretends to exit with "%s"', async (command) => {
      setup();
      await run(command);
      expect(lineOf('Exiting console...')).toHaveClass('console-line-success');
      expect(input()).toBeInTheDocument();
    });
  });

  describe('easter eggs', () => {
    it('prints a fake git status', async () => {
      setup();
      await run('git status');
      expect(lines()).toContain('On branch main');
      expect(lines()).toContain("Your branch is up to date with 'origin/main'.");
      expect(lines()).toContain('nothing to commit, working tree clean');
      expect(lines().some((l) => l.startsWith('(You should really not be using git'))).toBe(true);
    });

    it('greets whoever finds göken', async () => {
      setup();
      await run('göken');
      expect(lines()).toContain('Ja, du hittade mig, grattis! 🐦');
      expect(lines().some((l) => l.startsWith('Men tyvärr, det finns ingen hemlig funktion här.'))).toBe(true);
    });
  });

  describe('cart commands', () => {
    describe('cart add', () => {
      it('adds an available item to the cart', async () => {
        const { cart } = setup();
        await run('cart add läsk');
        expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
        expect(lineOf('Added Läsk to cart.')).toHaveClass('console-line-success');
      });

      it('refuses an unavailable item', async () => {
        const { cart } = setup();
        await run('cart add kaffe');
        expect(lineOf('Item "Kaffe" is not available for purchase.')).toHaveClass('console-line-error');
        expect(cart.addItemToCart).not.toHaveBeenCalled();
      });

      it('reports an unknown item', async () => {
        const { cart } = setup();
        await run('cart add ghost');
        expect(lineOf('No item found matching "ghost".')).toHaveClass('console-line-error');
        expect(cart.addItemToCart).not.toHaveBeenCalled();
      });
    });

    describe('cart set user', () => {
      it('sets the paying user', async () => {
        const { cart } = setup();
        await run('cart set user bob');
        expect(cart.setPayingUser).toHaveBeenCalledWith(bob);
        expect(lineOf('Set paying user to Bob.')).toHaveClass('console-line-success');
      });

      it('reports an unknown user', async () => {
        const { cart } = setup();
        await run('cart set user ghost');
        expect(lineOf('No user found matching "ghost".')).toHaveClass('console-line-error');
        expect(cart.setPayingUser).not.toHaveBeenCalled();
      });
    });

    describe('cart purchase', () => {
      it.each(['cart purchase', 'cart checkout'])('purchases the cart with "%s"', async (command) => {
        const { cart } = setup();
        await run(command);

        expect(await findLine('Purchase successful for Alice.')).toHaveClass('console-line-success');
        expect(cart.purchaseCart).toHaveBeenCalledTimes(1);
        expect(cart.purchaseCart).toHaveBeenCalledWith();
        expect(lines().some((l) => l.startsWith('User balance is now:'))).toBe(true);
      });

      it('reports a failed purchase', async () => {
        setup({ cart: { purchaseCart: vi.fn().mockResolvedValue(false) } });
        await run('cart purchase');
        expect(await findLine('Purchase failed for Alice.')).toHaveClass('console-line-error');
      });

      it('requires a paying user', async () => {
        const { cart } = setup({ cart: { payingUser: null } });
        await run('cart purchase');
        expect(
          lineOf('No paying user set. Use "cart set user <name>" to set one.')
        ).toHaveClass('console-line-error');
        expect(cart.purchaseCart).not.toHaveBeenCalled();
      });
    });

    describe('cart empty', () => {
      it.each(['cart empty', 'cart clear', 'cart reset', 'cart remove all', 'empty cart'])(
        'empties the cart with "%s"',
        async (command) => {
          const { cart } = setup();
          await run(command);
          expect(cart.emptyCart).toHaveBeenCalledTimes(1);
          expect(lineOf('Cart emptied.')).toHaveClass('console-line-success');
        }
      );
    });

    describe('cart show', () => {
      const noPayer = 'No paying user set. Use "cart set user <name>" to set one.';

      it.each(['cart show', 'cart view', 'cart list'])('lists the cart contents with "%s"', async (command) => {
        setup({
          cart: {
            itemsInCart: [
              { id: 'i1', name: 'Läsk', quantity: 2 },
              { id: 'i2', name: 'Kaffe', quantity: 1 },
            ],
          },
        });
        await run(command);
        expect(out().slice(-3)).toEqual(['Cart for Alice:', 'Läsk 2 st', 'Kaffe 1 st']);
      });

      it('requires a paying user', async () => {
        setup({ cart: { payingUser: null } });
        await run('cart show');
        expect(lineOf(noPayer)).toHaveClass('console-line-error');
      });

      it('reports an empty cart', async () => {
        setup();
        await run('cart show');
        expect(lineOf('Cart is empty.')).toHaveClass('console-line-error');
      });

      it.each(['cart show paying user', 'cart view paying user', 'cart who pays', 'cart paying user'])(
        'shows the paying user with "%s"',
        async (command) => {
          setup();
          await run(command);
          expect(lineOf('Paying user: Alice')).toHaveClass('console-line-success');
        }
      );

      it('reports a missing paying user', async () => {
        setup({ cart: { payingUser: null } });
        await run('cart paying user');
        expect(lineOf(noPayer)).toHaveClass('console-line-error');
      });
    });

    describe('cart help', () => {
      it.each(['cart help', 'cart commands'])('lists the cart commands with "%s"', async (command) => {
        setup();
        await run(command);
        expect(lineOf('Cart commands:')).toHaveClass('console-line-info');
        expect(lines()).toContain('cart add <item> Add an item to the cart');
        expect(lines()).toContain('cart show Show the items in the cart');
      });
    });
  });

  describe('command history', () => {
    it('does nothing on ArrowUp with no history', async () => {
      setup();
      await userEvent.keyboard('{ArrowUp}');
      expect(input()).toHaveValue('');
    });

    it('steps back through earlier commands and stops at the oldest', async () => {
      setup();
      await run('pwd');
      await run('whoami');

      await userEvent.keyboard('{ArrowUp}');
      expect(input()).toHaveValue('whoami');
      await userEvent.keyboard('{ArrowUp}');
      expect(input()).toHaveValue('pwd');
      await userEvent.keyboard('{ArrowUp}');
      expect(input()).toHaveValue('pwd');
    });

    it('steps forward again and clears the input past the newest command', async () => {
      setup();
      await run('pwd');
      await run('whoami');
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');

      await userEvent.keyboard('{ArrowDown}');
      expect(input()).toHaveValue('whoami');
      await userEvent.keyboard('{ArrowDown}');
      expect(input()).toHaveValue('');
    });

    it('does nothing on ArrowDown when not browsing history', async () => {
      setup();
      await run('pwd');
      await userEvent.type(input(), 'abc');
      await userEvent.keyboard('{ArrowDown}');
      expect(input()).toHaveValue('abc');
    });

    it('does not store empty commands', async () => {
      setup();
      await run('pwd');
      await run('   ');
      await userEvent.keyboard('{ArrowUp}');
      expect(input()).toHaveValue('pwd');
    });

    it('starts from the newest command again after running one', async () => {
      setup();
      await run('pwd');
      await run('whoami');
      await userEvent.keyboard('{ArrowUp}{ArrowUp}'); // browsing, at "pwd"
      await userEvent.keyboard('{Enter}'); // runs "pwd" again

      await userEvent.keyboard('{ArrowUp}');
      expect(input()).toHaveValue('pwd'); // the newest entry, not "whoami"
    });
  });
});
