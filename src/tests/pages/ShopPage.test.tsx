// src/tests/pages/ShopPage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ShopPage from '@/pages/shopPage/ShopPage'; // adjust path
import Cart from '@/components/cart/Cart';
import useInventoryContext from '@/contexts/InventoryContext';
import { useCartContext } from '@/contexts/CartContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ useCartContext: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
vi.mock('@/pages/loadingPage/LoadingPage', () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));
vi.mock('@/components/shopItem/ShopItem', () => ({
  default: ({ item }: { item: { name: string } }) => <div data-testid="shop-item">{item.name}</div>,
}));
vi.mock('@/components/cart/Cart', () => ({
  default: () => <div data-testid="cart" />,
}));

// ---------- test data ----------
const make = (over: Record<string, unknown>) => ({
  id: 'x',
  name: 'Vara',
  available: true,
  favorite: false,
  ...over,
});

const lask = make({ id: 'i1', name: 'Läsk' });
const kaffe = make({ id: 'i2', name: 'Kaffe', favorite: true });
const cider = make({ id: 'i3', name: 'Cider' });
const chips = make({ id: 'i4', name: 'Chips', favorite: true });
const dold = make({ id: 'i5', name: 'Dold', available: false });

// ---------- setup ----------
type Setup = {
  items?: unknown[];
  isLoadingInventory?: boolean;
  numberOfItemsInCart?: number;
  modalIsOpen?: boolean;
};

function setup(o: Setup = {}) {
  const openModal = vi.fn();
  vi.mocked(useInventoryContext).mockReturnValue({
    items: o.items ?? [lask, kaffe, cider, chips],
    isLoadingInventory: o.isLoadingInventory ?? false,
  } as any);
  vi.mocked(useCartContext).mockReturnValue({ numberOfItemsInCart: o.numberOfItemsInCart ?? 0 } as any);
  vi.mocked(useModalContext).mockReturnValue({ openModal, modalIsOpen: o.modalIsOpen ?? false } as any);

  render(<ShopPage />);
  return { openModal };
}

// ---------- helpers ----------
const searchInput = () => screen.getByPlaceholderText('Sök efter produkter...') as HTMLInputElement;
const clearButton = () => screen.getByRole('button', { name: 'clear search' });
const cartButton = () => screen.getByRole('button', { name: /Strecka/ });
const names = () => screen.queryAllByTestId('shop-item').map((el) => el.textContent);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ShopPage', () => {
  describe('search bar', () => {
    it('renders an empty search input', () => {
      setup();
      expect(searchInput()).toHaveValue('');
    });

    it('updates the input as the user types', async () => {
      setup();
      await userEvent.type(searchInput(), 'läs');
      expect(searchInput()).toHaveValue('läs');
    });

    it('shows no clear button while the input is empty', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'clear search' })).not.toBeInTheDocument();
    });

    it('shows a clear button once something is typed', async () => {
      setup();
      await userEvent.type(searchInput(), 'l');
      expect(clearButton()).toBeInTheDocument();
    });

    it('clears the search and the button when clicked', async () => {
      setup();
      await userEvent.type(searchInput(), 'läsk');
      await userEvent.click(clearButton());

      expect(searchInput()).toHaveValue('');
      expect(screen.queryByRole('button', { name: 'clear search' })).not.toBeInTheDocument();
    });

    it('shows every available item again after clearing', async () => {
      setup();
      await userEvent.type(searchInput(), 'läsk');
      expect(names()).toEqual(['Läsk']);

      await userEvent.click(clearButton());
      expect(names()).toHaveLength(4);
    });
  });

  describe('item list', () => {
    it('renders a shop item per available item', () => {
      setup();
      expect(screen.getAllByTestId('shop-item')).toHaveLength(4);
    });

    it('hides unavailable items', () => {
      setup({ items: [lask, dold] });
      expect(names()).toEqual(['Läsk']);
    });

    it('lists favorites first and keeps the original order within each group', () => {
      setup({ items: [lask, kaffe, cider, chips] });
      expect(names()).toEqual(['Kaffe', 'Chips', 'Läsk', 'Cider']);
    });

    it('shows each item only once', () => {
      setup();
      expect(new Set(names()).size).toBe(names().length);
    });

    it('shows an item whose favorite flag is missing', () => {
      setup({ items: [make({ id: 'n', name: 'Nytt', favorite: undefined })] });
      expect(names()).toEqual(['Nytt']);
    });
  });

  describe('filtering', () => {
    it('filters by name', async () => {
      setup();
      await userEvent.type(searchInput(), 'kaf');
      expect(names()).toEqual(['Kaffe']);
    });

    it('matches anywhere in the name, ignoring case', async () => {
      setup();
      await userEvent.type(searchInput(), 'ID');
      expect(names()).toEqual(['Cider']);
    });

    it('keeps favorites first among the matches', async () => {
      setup({ items: [lask, make({ id: 'a', name: 'Kaffe svart' }), make({ id: 'b', name: 'Kaffe latte', favorite: true })] });
      await userEvent.type(searchInput(), 'kaffe');
      expect(names()).toEqual(['Kaffe latte', 'Kaffe svart']);
    });

    it('never shows unavailable items, even when they match', async () => {
      setup({ items: [lask, dold] });
      await userEvent.type(searchInput(), 'dold');
      expect(names()).toEqual([]);
      expect(screen.getByText('Inga produkter hittades')).toBeInTheDocument();
    });

    it('shows the empty message when nothing matches the search', async () => {
      setup();
      await userEvent.type(searchInput(), 'finns inte');
      expect(screen.getByText('Inga produkter hittades')).toBeInTheDocument();
      expect(names()).toEqual([]);
    });
  });

  describe('empty and loading states', () => {
    it('shows the empty message when there are no items', () => {
      setup({ items: [] });
      expect(screen.getByText('Inga produkter hittades')).toBeInTheDocument();
    });

    it('shows the empty message when no item is available', () => {
      setup({ items: [dold] });
      expect(screen.getByText('Inga produkter hittades')).toBeInTheDocument();
    });

    it('shows the loading page instead of the list while loading', () => {
      setup({ isLoadingInventory: true });
      expect(screen.getByText('Laddar produkter...')).toBeInTheDocument();
      expect(screen.queryAllByTestId('shop-item')).toHaveLength(0);
    });

    it('shows the loading page instead of the empty message while loading', () => {
      setup({ items: [], isLoadingInventory: true });
      expect(screen.getByText('Laddar produkter...')).toBeInTheDocument();
      expect(screen.queryByText('Inga produkter hittades')).not.toBeInTheDocument();
    });

    it('keeps the search bar while loading', () => {
      setup({ isLoadingInventory: true });
      expect(searchInput()).toBeInTheDocument();
    });

    it('shows no loading page when not loading', () => {
      setup();
      expect(screen.queryByText('Laddar produkter...')).not.toBeInTheDocument();
    });
  });

  describe('cart button', () => {
    it('is hidden when the cart is empty', () => {
      setup({ numberOfItemsInCart: 0 });
      expect(screen.queryByRole('button', { name: /Strecka/ })).not.toBeInTheDocument();
    });

    it('shows the number of items and the label when the cart has items', () => {
      setup({ numberOfItemsInCart: 3 });
      expect(cartButton()).toHaveClass('show-cart-button');
      expect(cartButton()).toHaveTextContent('3');
      expect(cartButton()).toHaveTextContent('Strecka');
    });

    it('is hidden while a modal is open', () => {
      setup({ numberOfItemsInCart: 3, modalIsOpen: true });
      expect(screen.queryByRole('button', { name: /Strecka/ })).not.toBeInTheDocument();
    });

    it('opens the cart in a modal when clicked', async () => {
      const { openModal } = setup({ numberOfItemsInCart: 2 });
      await userEvent.click(cartButton());

      expect(openModal).toHaveBeenCalledTimes(1);
      expect(openModal.mock.calls[0][0].type).toBe(Cart);
    });

    it('does not open anything until it is clicked', () => {
      const { openModal } = setup({ numberOfItemsInCart: 2 });
      expect(openModal).not.toHaveBeenCalled();
    });

    it('is shown while the inventory is loading', () => {
      setup({ numberOfItemsInCart: 1, isLoadingInventory: true });
      expect(cartButton()).toBeInTheDocument();
    });
  });
});
