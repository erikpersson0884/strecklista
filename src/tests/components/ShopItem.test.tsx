import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ShopItem from '@/components/shopItem/ShopItem';
import useAuthContext from '@/contexts/AuthContext';
import useCartContext from '@/contexts/CartContext';
import useInventoryContext from '@/contexts/InventoryContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
vi.mock('@/components/swishQRCode/SwishQRCode', () => ({
  default: () => <div data-testid="swish-qr" />,
}));

const item = {
  id: 'item-1',
  name: 'Läsk',
  internalPrice: 12,
  amountInStock: 3,
  favorite: true,
  icon: '',
} as unknown as Item;
const addItemToCart = vi.fn();
const toggleFavourite = vi.fn();
const openModal = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCartContext).mockReturnValue(
    { addItemToCart, itemsInCart: [] } as unknown as ReturnType<typeof useCartContext>,
  );
  vi.mocked(useInventoryContext).mockReturnValue(
    { toggleFavourite } as unknown as ReturnType<typeof useInventoryContext>,
  );
  vi.mocked(useModalContext).mockReturnValue(
    { openModal } as unknown as ReturnType<typeof useModalContext>,
  );
  vi.mocked(useAuthContext).mockReturnValue(
    { currentUser: { id: 'user-1' } } as unknown as ReturnType<typeof useAuthContext>,
  );
});

describe('ShopItem', () => {
  it('renders stock, formatted price, cart quantity and favourite action', async () => {
    vi.mocked(useCartContext).mockReturnValue(
      { addItemToCart, itemsInCart: [{ ...item, quantity: 2 }] } as unknown as ReturnType<typeof useCartContext>,
    );
    render(<ShopItem item={item} />);

    expect(screen.getByText('3 st kvar')).toBeInTheDocument();
    expect(screen.getByText('12:-')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'heart' }));
    expect(toggleFavourite).toHaveBeenCalledWith(item);
  });

  it('adds the item to the cart when clicked', async () => {
    render(<ShopItem item={item} />);
    await userEvent.click(screen.getByText('Läsk'));
    expect(addItemToCart).toHaveBeenCalledWith(item);
  });

  it('does not render the favourite button for a client', () => {
    vi.mocked(useAuthContext).mockReturnValue(
      { currentUser: null } as unknown as ReturnType<typeof useAuthContext>,
    );
    render(<ShopItem item={item} />);
    expect(screen.queryByRole('button', { name: 'heart' })).not.toBeInTheDocument();
  });
});
