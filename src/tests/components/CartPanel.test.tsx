// src/tests/components/CartPanel.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import CartPanel from '@/components/cartPanel/CartPanel'; // adjust path
import useCartContext from '@/contexts/CartContext';
import useUsersContext from '@/contexts/UsersContext';

vi.mock('@/contexts/CartContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
// Render the barcode's text so the buttons get readable accessible names
vi.mock('react-barcode', () => ({
  default: ({ text }: { text: string }) => <span>{text}</span>,
}));
vi.mock('@/components/icon/Icon', () => ({
  default: ({ src }: { src?: string }) => <span data-testid="icon" data-src={src} />,
}));

const alice = { id: 'u1', nick: 'Alice' };
const bob = { id: 'u2', nick: 'Bob' };
const lask = { id: 'i1', name: 'Läsk', icon: 'lask.png', quantity: 1 };
const cider = { id: 'i2', name: 'Cider', icon: 'cider.png', quantity: 2 };

function renderPanel(overrides: Record<string, unknown> = {}) {
  const cart = {
    itemsInCart: [lask, cider],
    payingUser: alice,
    purchaseCart: vi.fn(),
    setPayingUser: vi.fn(),
    emptyCart: vi.fn(),
    ...overrides,
  };
  vi.mocked(useCartContext).mockReturnValue(cart as any);
  const view = render(<CartPanel />);

  // Simulates the context handing the panel a new items array
  const setItems = (itemsInCart: unknown[]) => {
    vi.mocked(useCartContext).mockReturnValue({ ...cart, itemsInCart } as any);
    view.rerender(<CartPanel />);
  };
  return { cart, setItems };
}

const row = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useUsersContext).mockReturnValue({ users: [alice, bob] } as any);
});

describe('CartPanel', () => {
  describe('items', () => {
    it('lists each item with its name, quantity and icon', () => {
      renderPanel();
      expect(screen.getByRole('heading', { name: 'Kundvagn' })).toBeInTheDocument();
      expect(row('Läsk')).toHaveTextContent('1 st');
      expect(row('Cider')).toHaveTextContent('2 st');
      expect(screen.getAllByTestId('icon').map((i) => i.dataset.src)).toEqual([
        'lask.png',
        'cider.png',
      ]);
    });

    it('shows the empty message when the cart is empty', () => {
      renderPanel({ itemsInCart: [] });
      expect(screen.getByText('Kundvagnen är tom')).toBeInTheDocument();
    });

    it('hides the empty message when there are items', () => {
      renderPanel();
      expect(screen.queryByText('Kundvagnen är tom')).not.toBeInTheDocument();
    });
  });

  describe('paying user select', () => {
    it('lists "Ingen" plus every user', () => {
      renderPanel();
      const options = screen.getAllByRole('option').map((o) => o.textContent);
      expect(options).toEqual(['Ingen', 'Alice', 'Bob']);
    });

    it('selects the current paying user', () => {
      renderPanel();
      expect(screen.getByRole('combobox')).toHaveValue('u1');
    });

    it('selects "Ingen" when there is no paying user', () => {
      renderPanel({ payingUser: null });
      expect(screen.getByRole('combobox')).toHaveValue('');
    });

    it('sets the paying user when another user is chosen', async () => {
      const { cart } = renderPanel();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'u2');
      expect(cart.setPayingUser).toHaveBeenCalledWith(bob);
    });

    it('clears the paying user when "Ingen" is chosen', async () => {
      const { cart } = renderPanel();
      await userEvent.selectOptions(screen.getByRole('combobox'), 'Ingen');
      expect(cart.setPayingUser).toHaveBeenCalledWith(null);
    });
  });

  describe('reset', () => {
    it('empties the cart and clears the paying user', async () => {
      const { cart } = renderPanel();
      await userEvent.click(screen.getByRole('button', { name: 'Töm' }));
      expect(cart.emptyCart).toHaveBeenCalledTimes(1);
      expect(cart.setPayingUser).toHaveBeenCalledWith(null);
    });
  });

  describe('checkout', () => {
    it('purchases the cart with the skrubblista comment', async () => {
      const { cart } = renderPanel();
      await userEvent.click(screen.getByRole('button', { name: 'Strecka' }));
      expect(cart.purchaseCart).toHaveBeenCalledWith('Bought with skrubblista');
    });

    it('is disabled when there is no paying user', () => {
      renderPanel({ payingUser: null });
      expect(screen.getByRole('button', { name: 'Strecka' })).toBeDisabled();
    });

    it('is disabled when the cart is empty', () => {
      renderPanel({ itemsInCart: [] });
      expect(screen.getByRole('button', { name: 'Strecka' })).toBeDisabled();
    });

    it('is enabled with a paying user and items', () => {
      renderPanel();
      expect(screen.getByRole('button', { name: 'Strecka' })).toBeEnabled();
    });
  });

  describe('blinking', () => {
    // No userEvent in here: it doesn't mix well with fake timers
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    const isBlinking = (name: string) => row(name).classList.contains('blinking');
    const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

    it('blinks the first item on mount, then stops after one second', () => {
      renderPanel();
      expect(isBlinking('Läsk')).toBe(true);
      expect(isBlinking('Cider')).toBe(false); // only the first "bumped" item blinks

      advance(999);
      expect(isBlinking('Läsk')).toBe(true);
      advance(1);
      expect(isBlinking('Läsk')).toBe(false);
    });

    it('blinks an item whose quantity increases', () => {
      const { setItems } = renderPanel({ itemsInCart: [lask] });
      advance(1000);

      setItems([{ ...lask, quantity: 2 }]);
      expect(isBlinking('Läsk')).toBe(true);
    });

    it('blinks a newly added item but not the existing ones', () => {
      const { setItems } = renderPanel({ itemsInCart: [lask] });
      advance(1000);

      setItems([lask, cider]);
      expect(isBlinking('Cider')).toBe(true);
      expect(isBlinking('Läsk')).toBe(false);
    });

    it('does not blink when a quantity decreases', () => {
      const { setItems } = renderPanel({ itemsInCart: [cider] });
      advance(1000);

      setItems([{ ...cider, quantity: 1 }]);
      expect(isBlinking('Cider')).toBe(false);
    });

    it('does not blink when the items are unchanged', () => {
      const { setItems } = renderPanel({ itemsInCart: [cider] });
      advance(1000);

      setItems([{ ...cider }]); // new array, same quantities
      expect(isBlinking('Cider')).toBe(false);
    });

    // Fails on the current code (see "blink gets stuck" below).
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('stops blinking even if the cart changes during the blink', () => {
      const { setItems } = renderPanel({ itemsInCart: [cider] });
      advance(1000);

      setItems([cider, lask]);
      expect(isBlinking('Läsk')).toBe(true);

      advance(500);
      setItems([lask]); // removing an item is not a "bump"
      advance(1000);

      expect(isBlinking('Läsk')).toBe(false);
    });
  });
});