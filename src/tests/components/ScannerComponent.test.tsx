// src/tests/components/ScannerComponent.test.tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ScannerComponent from '@/components/scannerComponent/ScannerComponent'; // adjust path
import { useCartContext } from '@/contexts/CartContext';
import useUsersContext from '@/contexts/UsersContext';
import useInventoryContext from '@/contexts/InventoryContext';
import { useNotificationContext } from '@/contexts/NotificationContext';

vi.mock('@/contexts/CartContext', () => ({ useCartContext: vi.fn() }));
vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/NotificationContext', () => ({ useNotificationContext: vi.fn() }));

// ---------- test data ----------
const lask = { id: 1, name: 'Läsk', externalId: 'item1' };
const kaffe = { id: 2, name: 'Kaffe', externalId: 'item2' };
const alice = { id: 7, nick: 'Alice', externalId: 'user1' };
const bob = { id: 8, nick: 'Bob', externalId: 'user2' };

type Overrides = {
  className?: string;
  cart?: Record<string, unknown>;
  users?: Record<string, unknown>;
  inventory?: Record<string, unknown>;
};

function setup(o: Overrides = {}) {
  const cart = {
    setPayingUser: vi.fn(),
    addItemToCart: vi.fn(),
    purchaseCart: vi.fn().mockResolvedValue(true),
    emptyCart: vi.fn(),
    payingUser: alice,
    itemsInCart: [{ id: 'i1', name: 'Läsk', quantity: 1 }],
    ...o.cart,
  };
  const notify = vi.fn();

  vi.mocked(useCartContext).mockReturnValue(cart as any);
  vi.mocked(useUsersContext).mockReturnValue({ users: [alice, bob], ...o.users } as any);
  vi.mocked(useInventoryContext).mockReturnValue({ items: [lask, kaffe], ...o.inventory } as any);
  vi.mocked(useNotificationContext).mockReturnValue({ notify } as any);

  render(<ScannerComponent className={o.className} />);
  return { cart, notify };
}

// ---------- helpers ----------
const input = () => screen.getByRole('textbox') as HTMLInputElement;
const key = (k: string) => fireEvent.keyDown(input(), { key: k });
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const flush = () => act(async () => {}); // lets awaited handlers (purchaseCart) finish

// Types a string like a scanner: 10 ms between characters, well under the 50 ms limit
const typeFast = (text: string, gap = 10) => {
  [...text].forEach((char, i) => {
    if (i > 0) tick(gap);
    key(char);
  });
};
const scan = (code: string) => {
  typeFast(code);
  key('Enter');
};

beforeEach(() => {
  vi.clearAllMocks();
  // performance is faked too, because the gap check reads performance.now()
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ScannerComponent', () => {
  describe('rendering', () => {
    it('renders an empty input with a placeholder', () => {
      setup();
      expect(input()).toHaveValue('');
      expect(input()).toHaveAttribute('placeholder', 'Scan barcode...');
    });

    it('applies the className', () => {
      setup({ className: 'scanner' });
      expect(input()).toHaveClass('scanner');
    });

    it('focuses the input on mount', () => {
      setup();
      expect(input()).toHaveFocus();
    });
  });

  describe('keeping focus', () => {
    beforeEach(() => {
      // Run the animation frame callback immediately
      vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });
    });

    it('takes focus back when it is lost and nothing else has it', () => {
      setup();
      act(() => input().blur());
      expect(input()).toHaveFocus();
    });

    it('lets another element keep focus', () => {
      setup();
      const other = document.createElement('button');
      document.body.appendChild(other);

      act(() => other.focus());

      expect(other).toHaveFocus();
      expect(input()).not.toHaveFocus();
      other.remove();
    });
  });

  describe('collecting characters', () => {
    it('shows the scanned characters in the input', () => {
      setup();
      typeFast('abc');
      expect(input()).toHaveValue('abc');
    });

    it('ignores modifier and control keys', () => {
      setup();
      key('i');
      key('Shift');
      key('ArrowLeft');
      key('t');
      expect(input()).toHaveValue('it');
    });

    it('prevents the default action of Enter', () => {
      setup();
      typeFast('abc');
      expect(key('Enter')).toBe(false); // fireEvent returns false when default was prevented
    });

    it('throws away stale partial input when a new scan starts after a pause', () => {
      const { cart } = setup();
      typeFast('xx');
      tick(60); // longer than the 50 ms character gap, shorter than the 100 ms idle time

      scan('item1');

      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
    });

    it('keeps the buffer when characters arrive within the gap limit', () => {
      setup();
      typeFast('ab', 50);
      expect(input()).toHaveValue('ab');
    });

    it('does nothing when Enter is pressed with an empty buffer', () => {
      const { cart, notify } = setup();
      key('Enter');
      expect(notify).not.toHaveBeenCalled();
      expect(cart.addItemToCart).not.toHaveBeenCalled();
    });

    it('clears the input after processing a scan', () => {
      setup();
      scan('item1');
      expect(input()).toHaveValue('');
    });
  });

  describe('scanners that do not send Enter', () => {
    it('processes the buffer after 100 ms without a new character', () => {
      const { cart } = setup();
      typeFast('item1');

      tick(99);
      expect(cart.addItemToCart).not.toHaveBeenCalled();

      tick(1);
      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
      expect(input()).toHaveValue('');
    });

    it('restarts the idle timer with every new character', () => {
      const { cart } = setup();
      typeFast('item1', 90); // each gap is under 100 ms but the scan takes 360 ms in total
      // The 90 ms gaps are over the 50 ms limit, so each character starts a new buffer
      tick(100);
      expect(cart.addItemToCart).not.toHaveBeenCalled(); // "1" alone is not a barcode
    });
  });

  describe('items', () => {
    it('adds the matching item to the cart', () => {
      const { cart, notify } = setup();
      scan('item1');

      expect(cart.addItemToCart).toHaveBeenCalledTimes(1);
      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
      expect(notify).not.toHaveBeenCalled();
    });

    it('strips "!" from the scanned code', () => {
      const { cart } = setup();
      scan('it!em1');
      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
    });

    it('strips "!" and line breaks from the stored external id', () => {
      const messy = { id: 3, name: 'Cider', externalId: 'ab!\n' };
      const { cart } = setup({ inventory: { items: [messy] } });
      scan('ab');
      expect(cart.addItemToCart).toHaveBeenCalledWith(messy);
    });

    it('matches the whole code, not a part of it', () => {
      const { cart, notify } = setup();
      scan('item');
      expect(cart.addItemToCart).not.toHaveBeenCalled();
      expect(notify).toHaveBeenCalledWith('Okänd streckkod: item', 'error');
    });
  });

  describe('users', () => {
    it('sets the paying user when the code matches an external id', () => {
      const { cart } = setup();
      scan('user2');
      expect(cart.setPayingUser).toHaveBeenCalledTimes(1);
      expect(cart.setPayingUser).toHaveBeenCalledWith(bob);
    });

    it('sets the paying user when the code matches the user id', () => {
      const { cart } = setup();
      scan('7');
      expect(cart.setPayingUser).toHaveBeenCalledWith(alice);
    });

    it('strips "!" from the stored user external id', () => {
      const messy = { id: 9, nick: 'Cy', externalId: 'zz!' };
      const { cart } = setup({ users: { users: [messy] } });
      scan('zz');
      expect(cart.setPayingUser).toHaveBeenCalledWith(messy);
    });
  });

  describe('ambiguous codes', () => {
    const clashing = {
      inventory: { items: [{ id: 1, name: 'Läsk', externalId: 'dup' }, kaffe] },
      users: { users: [{ id: 7, nick: 'Alice', externalId: 'dup' }] },
    };

    it('warns and adds nothing when a code matches both an item and a user', () => {
      const { cart, notify } = setup(clashing);
      scan('dup');

      expect(notify).toHaveBeenCalledWith(
        'Varning: streckkoden matchar både en produkt och en användare. Inget kommer att läggas till.',
        'error'
      );
      expect(cart.addItemToCart).not.toHaveBeenCalled();
      expect(cart.setPayingUser).not.toHaveBeenCalled();
    });

    it('does not start a cooldown after the warning', () => {
      const { cart } = setup(clashing);
      scan('dup');
      scan('item2');
      expect(cart.addItemToCart).toHaveBeenCalledWith(kaffe);
    });
  });

  describe('checkout', () => {
    it('purchases the cart', async () => {
      const { cart } = setup();
      scan('checkout');
      await flush();

      expect(cart.purchaseCart).toHaveBeenCalledTimes(1);
      expect(cart.purchaseCart).toHaveBeenCalledWith();
    });

    it('does not purchase without a paying user', () => {
      const { cart, notify } = setup({ cart: { payingUser: null } });
      scan('checkout');

      expect(cart.purchaseCart).not.toHaveBeenCalled();
      expect(notify).toHaveBeenCalledWith('Okänd streckkod: checkout', 'error');
    });

    it('does not purchase an empty cart', () => {
      const { cart, notify } = setup({ cart: { itemsInCart: [] } });
      scan('checkout');

      expect(cart.purchaseCart).not.toHaveBeenCalled();
      expect(notify).toHaveBeenCalledWith('Okänd streckkod: checkout', 'error');
    });

    it('is case-sensitive', () => {
      const { cart, notify } = setup();
      scan('Checkout');
      expect(cart.purchaseCart).not.toHaveBeenCalled();
      expect(notify).toHaveBeenCalledWith('Okänd streckkod: Checkout', 'error');
    });

    it('starts the cooldown once the purchase has finished', async () => {
      const { cart } = setup();
      scan('checkout');
      await flush();

      scan('item1');
      expect(cart.addItemToCart).not.toHaveBeenCalled();
    });
  });

  describe('empty cart code', () => {
    it('empties the cart', () => {
      const { cart } = setup();
      scan('emptyCart');
      expect(cart.emptyCart).toHaveBeenCalledTimes(1);
    });
  });

  describe('unknown codes', () => {
    it('reports the code as unknown', () => {
      const { cart, notify } = setup();
      scan('nope');

      expect(notify).toHaveBeenCalledTimes(1);
      expect(notify).toHaveBeenCalledWith('Okänd streckkod: nope', 'error');
      expect(cart.addItemToCart).not.toHaveBeenCalled();
      expect(cart.setPayingUser).not.toHaveBeenCalled();
    });

    it('does not start a cooldown', () => {
      const { cart } = setup();
      scan('nope');
      scan('item1');
      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
    });

    // Both fail on the current code (see "undefined" below).
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('does not match an item without an externalId when "undefined" is scanned', () => {
      const { cart } = setup({ inventory: { items: [{ id: 1, name: 'Läsk' }] } });
      scan('undefined');
      expect(cart.addItemToCart).not.toHaveBeenCalled();
    });

    it.fails('does not match a user without an externalId when "undefined" is scanned', () => {
      const { cart } = setup({ users: { users: [{ id: 7, nick: 'Alice' }] } });
      scan('undefined');
      expect(cart.setPayingUser).not.toHaveBeenCalled();
    });
  });

  describe('cooldown', () => {
    it('ignores scans right after a successful one', () => {
      const { cart } = setup();
      scan('item1');
      scan('item2');

      expect(cart.addItemToCart).toHaveBeenCalledTimes(1);
      expect(cart.addItemToCart).toHaveBeenCalledWith(lask);
    });

    it('drops scans during the cooldown without any message', () => {
      const { notify } = setup();
      scan('item1');
      scan('nope');
      expect(notify).not.toHaveBeenCalled();
    });

    it('still clears the input for a dropped scan', () => {
      setup();
      scan('item1');
      scan('item2');
      expect(input()).toHaveValue('');
    });

    it('accepts scans again after 200 ms', () => {
      const { cart } = setup();
      scan('item1');
      tick(200);
      scan('item2');

      expect(cart.addItemToCart).toHaveBeenCalledTimes(2);
      expect(cart.addItemToCart).toHaveBeenLastCalledWith(kaffe);
    });

    it('is still active just before 200 ms', () => {
      const { cart } = setup();
      scan('item1');
      tick(199);
      key('7'); // a one-character scan, finished with Enter
      key('Enter');
      expect(cart.setPayingUser).not.toHaveBeenCalled();
    });
  });
});
