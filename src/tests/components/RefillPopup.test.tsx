import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RefillPopup from '@/components/refillPopup/RefillPopup';
import useModalContext from '@/contexts/ModalContext';
import useNotificationContext from '@/contexts/NotificationContext';

vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/NotificationContext', () => ({ default: vi.fn() }));

const item = {
  id: 'item-1',
  name: 'Läsk',
  icon: '',
} as unknown as Item;
const closeModal = vi.fn();
const notify = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useModalContext).mockReturnValue(
    { closeModal } as unknown as ReturnType<typeof useModalContext>,
  );
  vi.mocked(useNotificationContext).mockReturnValue(
    { notify } as unknown as ReturnType<typeof useNotificationContext>,
  );
});

describe('RefillPopup', () => {
  it('renders the current and calculated balance', () => {
    render(
      <RefillPopup item={item} currentBalance={25} suffix="kr" refillAction={vi.fn()} />,
    );

    expect(screen.getByText('Läsk')).toBeInTheDocument();
    expect(screen.getAllByText('25')).toHaveLength(2);
    expect(screen.getByText('Nytt saldo:').parentElement).toHaveTextContent('25kr');
    expect(screen.getByRole('button', { name: 'Fyll på med 0 kr' })).toBeDisabled();
  });

  it('sanitizes the amount and sends a refill with an optional comment', async () => {
    const refillAction = vi.fn().mockResolvedValue(true);
    render(
      <RefillPopup item={item} currentBalance={25} suffix="kr" refillAction={refillAction} />,
    );

    const amount = screen.getByLabelText('Fyll på med:');
    await userEvent.type(amount, '12x.5');
    await userEvent.click(screen.getByRole('button', { name: 'Lägg till kommentar' }));
    await userEvent.type(screen.getByLabelText('Kommentar (valfritt):'), 'Påfyllning');
    await userEvent.click(screen.getByRole('button', { name: 'Fyll på med 12.5 kr' }));

    expect(refillAction).toHaveBeenCalledWith('item-1', 12.5, 'Påfyllning');
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('notifies when the refill fails', async () => {
    const refillAction = vi.fn().mockResolvedValue(false);
    render(
      <RefillPopup item={item} currentBalance={25} suffix="kr" refillAction={refillAction} />,
    );

    await userEvent.type(screen.getByLabelText('Fyll på med:'), '10');
    await userEvent.click(screen.getByRole('button', { name: 'Fyll på med 10 kr' }));

    expect(notify).toHaveBeenCalledWith('Något gick fel, försök igen senare.');
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('submits the amount when Enter is pressed', async () => {
    const refillAction = vi.fn().mockResolvedValue(true);
    render(
      <RefillPopup item={item} currentBalance={25} suffix="kr" refillAction={refillAction} />,
    );

    const amount = screen.getByLabelText('Fyll på med:');
    await userEvent.type(amount, '5');
    await userEvent.keyboard('{Enter}');

    expect(refillAction).toHaveBeenCalledWith('item-1', 5, undefined);
  });
});
