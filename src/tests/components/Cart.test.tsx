// src/tests/components/Cart.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Cart from '@/components/cart/Cart'; // adjust path
import { useCartContext } from '@/contexts/CartContext';
import useUsersContext from '@/contexts/UsersContext';
import useModalContext from '@/contexts/ModalContext';
import useNotificationContext from '@/contexts/NotificationContext';

vi.mock('@/contexts/CartContext', () => ({ useCartContext: vi.fn() }));
vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/NotificationContext', () => ({ default: vi.fn() }));
vi.mock('@/components/cart/cartItem/CartItem', () => ({ // adjust path
  default: ({ item }: { item: { id: number; displayName: string } }) => (
    <li>{item.displayName}</li>
  ),
}));

const alice = { id: 'u1', nick: 'Alice' };
const bob = { id: 'u2', nick: 'Bob' };

function setup(cartOverrides = {}) {
  const cart = {
    itemsInCart: [{ id: 1, displayName: 'Läsk' }],
    payingUser: alice,
    total: 12,
    setPayingUser: vi.fn(),
    purchaseCart: vi.fn().mockResolvedValue(true),
    ...cartOverrides,
  };
  const closeModal = vi.fn();
  const notify = vi.fn();

  vi.mocked(useCartContext).mockReturnValue(cart as any);
  vi.mocked(useUsersContext).mockReturnValue({
    users: [alice, bob],
    getUserFromUserId: (id: string) => [alice, bob].find((u) => u.id === id),
  } as any);
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
  vi.mocked(useNotificationContext).mockReturnValue({ notify } as any);

  render(<Cart />);
  return { cart, closeModal, notify };
}

describe('Cart', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the empty message and disables paying when the cart is empty', () => {
    setup({ itemsInCart: [] });
    expect(screen.getByText('Din korg är tom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sträcka' })).toBeDisabled();
  });

  it('disables paying when no user is selected', () => {
    setup({ payingUser: null });
    expect(screen.getByRole('button', { name: 'Sträcka' })).toBeDisabled();
  });

  it('purchases without a comment and closes the modal on success', async () => {
    const { cart, closeModal, notify } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Sträcka' }));

    expect(cart.purchaseCart).toHaveBeenCalledWith(undefined);
    expect(closeModal).toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it('notifies and keeps the modal open when the purchase fails', async () => {
    const { closeModal, notify } = setup({
      purchaseCart: vi.fn().mockResolvedValue(false),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Sträcka' }));

    expect(notify).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('sends the comment when one is added', async () => {
    const { cart } = setup();
    await userEvent.click(screen.getByRole('button', { name: /lägg till kommentar/i }));
    await userEvent.type(screen.getByLabelText(/kommentar/i), 'Göken bad mig');
    await userEvent.click(screen.getByRole('button', { name: 'Sträcka' }));

    expect(cart.purchaseCart).toHaveBeenCalledWith('Göken bad mig');
  });

  it('drops the comment if the user removes it before paying', async () => {
    const { cart } = setup();
    await userEvent.click(screen.getByRole('button', { name: /lägg till kommentar/i }));
    await userEvent.type(screen.getByLabelText(/kommentar/i), 'hej');
    await userEvent.click(screen.getByRole('button', { name: 'Ingen Kommentar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sträcka' }));

    expect(cart.purchaseCart).toHaveBeenCalledWith(undefined);
  });

  it('changes the paying user from the select', async () => {
    const { cart } = setup();
    await userEvent.selectOptions(screen.getByLabelText('Sträcka åt'), 'u2');

    expect(cart.setPayingUser).toHaveBeenCalledWith(bob);
  });

  it('shows the formatted total', () => {
    setup({ total: 1234.5 });
    expect(screen.getByText(/kr$/)).toBeInTheDocument();
  });
});
