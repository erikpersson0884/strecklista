// src/tests/components/CartItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CartItem from '@/components/cart/cartItem/CartItem'; // adjust path
import { useCartContext } from '@/contexts/CartContext';

vi.mock('@/contexts/CartContext', () => ({ useCartContext: vi.fn() }));

const item = { id: 1, name: 'Läsk', quantity: 3 } as any; // adjust to your ItemInCart shape

function setup() {
  const cart = {
    removeProductFromCart: vi.fn(),
    increaseProductQuantity: vi.fn(),
    decreaseProductQuantity: vi.fn(),
    setProductQuantity: vi.fn(),
  };
  vi.mocked(useCartContext).mockReturnValue(cart as any);

  render(
    <ul>
      <CartItem item={item} />
    </ul>
  );
  return { cart, input: screen.getByRole('textbox') as HTMLInputElement };
}

describe('CartItem', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the item name and quantity', () => {
    const { input } = setup();
    expect(screen.getByText('Läsk')).toBeInTheDocument();
    expect(input).toHaveValue('3');
  });

  it('increases the quantity', async () => {
    const { cart } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'plus' }));
    expect(cart.increaseProductQuantity).toHaveBeenCalledWith(item);
  });

  it('decreases the quantity', async () => {
    const { cart } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'minus' }));
    expect(cart.decreaseProductQuantity).toHaveBeenCalledWith(item);
  });

  it('removes the item', async () => {
    const { cart } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'delete' }));
    expect(cart.removeProductFromCart).toHaveBeenCalledWith(item);
  });

  it('sets the quantity when a valid number is typed', () => {
    const { cart, input } = setup();
    fireEvent.change(input, { target: { value: '7' } });
    expect(cart.setProductQuantity).toHaveBeenCalledWith(1, 7);
  });

  it('treats an empty input as 0', () => {
    const { cart, input } = setup();
    fireEvent.change(input, { target: { value: '' } });
    expect(cart.setProductQuantity).toHaveBeenCalledWith(1, 0);
  });

  it.each(['-1', '1.5', 'abc'])('ignores invalid input "%s"', (value) => {
    const { cart, input } = setup();
    fireEvent.change(input, { target: { value } });
    expect(cart.setProductQuantity).not.toHaveBeenCalled();
  });
});