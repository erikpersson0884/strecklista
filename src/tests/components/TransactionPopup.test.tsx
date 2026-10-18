// src/tests/components/TransactionPopup.test.tsx
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import TransactionPopup from '@/components/transactionPopup/TransactionPopup'; // adjust path
import useTransactionsContext from '@/contexts/TransactionsContext';
import useUsersContext from '@/contexts/UsersContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/TransactionsContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

// ---------- test data ----------
const alice = { id: 7, nick: 'Alice' };
const bob = { id: 8, nick: 'Bob' };
const users: Record<number, unknown> = { 7: alice, 8: bob };

// Built from local parts, so the expected text doesn't depend on the machine's time zone
const created = new Date(2025, 0, 5, 9, 7).getTime();

const base = { id: 5, createdTime: created, removed: false, comment: null };

const purchase = {
  ...base,
  type: 'purchase',
  createdFor: 7,
  createdBy: { userId: 8, id: 8 }, // adjust to your ITransaction shape
  comment: 'Göken bad mig',
  total: 36,
  items: [
    { item: { id: 1, displayName: 'Läsk' }, quantity: 2, purchasePrice: { price: 12, displayName: 'Internt' } },
    { item: { id: 2, displayName: 'Kaffe' }, quantity: 1, purchasePrice: { price: 12, displayName: 'Internt' } },
  ],
};

const deposit = {
  ...base,
  type: 'deposit',
  createdFor: 7,
  createdBy: { userId: 8, id: 8 },
  total: 500,
};

const stockUpdate = {
  ...base,
  type: 'stockUpdate',
  createdBy: { userId: 8, id: 8 },
  items: [
    { id: 1, name: 'Läsk', before: 5, after: 20 },
    { id: 2, name: 'Kaffe', before: 10, after: 4 },
  ],
};

const tx = (t: object, over: Record<string, unknown> = {}) => ({ ...t, ...over }) as any;

// ---------- setup ----------
function setup(transaction: any, opts: { removeResult?: boolean; lookup?: (id: number) => unknown } = {}) {
    const { removeResult = true, lookup = (id: number) => users[id] } = opts;
    const removeTransaction = vi.fn().mockResolvedValue(removeResult);
    const openModal = vi.fn();
    const closeModal = vi.fn();
    const getUserFromUserId = vi.fn(lookup);

    vi.mocked(useTransactionsContext).mockReturnValue({ removeTransaction } as any);
    vi.mocked(useUsersContext).mockReturnValue({ getUserFromUserId } as any);
    vi.mocked(useModalContext).mockReturnValue({ openModal, closeModal } as any);

    render(<TransactionPopup transaction={transaction} />);
    return { removeTransaction, openModal, closeModal, getUserFromUserId };
}

// Rows look like <p><span>label</span><span>value</span></p>
const row = (label: string) => screen.getByText(label).closest('p') as HTMLElement;
const listItem = (name: string) => screen.getByText(name).closest('li') as HTMLElement;
const deleteButton = () => screen.getByRole('button', { name: 'Stryk Transaktion' });

// Clicks "Stryk Transaktion", then renders the dialog that was handed to openModal
async function openConfirmDialog(transaction: any, opts?: { removeResult?: boolean }) {
  const ctx = setup(transaction, opts);
  await userEvent.click(deleteButton());
  const dialog = ctx.openModal.mock.calls[0][0];
  cleanup();
  render(dialog);
  return ctx;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TransactionPopup', () => {
  describe('titles for active transactions', () => {
    it.each([
      ['purchase', purchase, 'Köp'],
      ['deposit', deposit, 'Insättning'],
      ['stockUpdate', stockUpdate, 'Lageruppdatering'],
      ['an unknown type', tx(base, { type: 'refund' }), 'Okänd'],
    ])('uses the right title for %s', (_name, transaction, title) => {
      setup(transaction);
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });

    it('applies the transaction-popup class', () => {
      setup(purchase);
      expect(document.querySelector('.popup-window')).toHaveClass('transaction-popup');
    });
  });

  describe('date and time', () => {
    it('shows the date and time from a timestamp', () => {
      setup(purchase);
      expect(screen.getByText('2025-01-05')).toBeInTheDocument();
      expect(screen.getByText('09:07')).toBeInTheDocument();
    });

    it('also accepts a Date object', () => {
      setup(tx(purchase, { createdTime: new Date(2025, 11, 24, 18, 30) }));
      expect(screen.getByText('2025-12-24')).toBeInTheDocument();
      expect(screen.getByText('18:30')).toBeInTheDocument();
    });

    it('pads single-digit months, days, hours and minutes', () => {
      setup(tx(purchase, { createdTime: new Date(2025, 2, 4, 5, 6).getTime() }));
      expect(screen.getByText('2025-03-04')).toBeInTheDocument();
      expect(screen.getByText('05:06')).toBeInTheDocument();
    });

    it('shows the raw value and no time when the date is invalid', () => {
      setup(tx(purchase, { createdTime: 'garbage' }));
      expect(screen.getByText('garbage')).toBeInTheDocument();
      expect(document.querySelectorAll('.transaction-bubble')[1]).toHaveTextContent('');
    });
  });

  describe('affected account', () => {
    it('shows the nick of the account the transaction was created for', () => {
      const { getUserFromUserId } = setup(purchase);
      expect(row('Berört konto:')).toHaveTextContent('Berört konto:Alice');
      expect(getUserFromUserId).toHaveBeenCalledWith(7);
    });

    it('shows a plain string when the lookup returns one', () => {
        setup(purchase, { lookup: () => 'Borttagen användare' });
        expect(row('Berört konto:')).toHaveTextContent('Borttagen användare');
        expect(row('Utförd av:')).toHaveTextContent('Borttagen användare');
    });

    it('is not shown for stock updates', () => {
      setup(stockUpdate);
      expect(screen.queryByText('Berört konto:')).not.toBeInTheDocument();
    });
  });

  describe('created by', () => {
    it('shows the nick of the user who created it', () => {
      const { getUserFromUserId } = setup(purchase);
      expect(row('Utförd av:')).toHaveTextContent('Utförd av:Bob');
      expect(getUserFromUserId).toHaveBeenCalledWith(8);
    });

    it('shows "En klient" for a transaction created by a client', () => {
      setup(tx(purchase, { createdBy: { clientId: 3 } }));
      expect(row('Utförd av:')).toHaveTextContent('Utförd av:En klient');
    });

    it.each([undefined, null])('shows an unknown creator when createdBy is %s', (createdBy) => {
      setup(tx(purchase, { createdBy }));
      expect(row('Utförd av:')).toHaveTextContent('Okänd');
    });
  });

  describe('purchase', () => {
    it('lists each product with quantity and line total', () => {
      setup(purchase);
      expect(screen.getByText('Produkter')).toBeInTheDocument();
      expect(listItem('Läsk')).toHaveTextContent(/Läsk\s*2st\s*24 kr/);
      expect(listItem('Kaffe')).toHaveTextContent(/Kaffe\s*1st\s*12 kr/);
    });

    it('shows the total', () => {
      setup(purchase);
      expect(row('Totalt:')).toHaveTextContent(/Totalt:\s*36\s*kr/);
    });

    it('does not show the deposit sum', () => {
      setup(purchase);
      expect(screen.queryByText('Summa insatt:')).not.toBeInTheDocument();
    });

    it('shows the comment', () => {
      setup(purchase);
      expect(screen.getByText('Kommentar:')).toBeInTheDocument();
      expect(screen.getByText('Göken bad mig')).toHaveClass('comment');
    });

    it.each([null, ''])('hides the comment section when the comment is %j', (comment) => {
      setup(tx(purchase, { comment }));
      expect(screen.queryByText('Kommentar:')).not.toBeInTheDocument();
    });
  });

  describe('deposit', () => {
    it('shows the deposited sum', () => {
      setup(deposit);
      expect(row('Summa insatt:')).toHaveTextContent(/Summa insatt:\s*500\s*kr/);
    });

    it('has no product list and no purchase total', () => {
      setup(deposit);
      expect(screen.queryByText('Produkter')).not.toBeInTheDocument();
      expect(screen.queryByText('Totalt:')).not.toBeInTheDocument();
    });

    it('shows its comment', () => {
      setup(tx(deposit, { comment: 'Swish' }));
      expect(screen.getByText('Swish')).toBeInTheDocument();
    });
  });

  describe('stock update', () => {
    it('lists each item with its change', () => {
      setup(stockUpdate);
      expect(screen.getByText('Produkter')).toBeInTheDocument();
      expect(listItem('Läsk')).toHaveTextContent(/15/);
      expect(listItem('Kaffe')).toHaveTextContent(/-6/);
    });

    it('does not show quantities, totals or deposit sums', () => {
      setup(stockUpdate);
      expect(screen.queryByText(/st$/)).not.toBeInTheDocument();
      expect(screen.queryByText('Totalt:')).not.toBeInTheDocument();
      expect(screen.queryByText('Summa insatt:')).not.toBeInTheDocument();
    });

    // Fails on the current code: the comment is only read for purchases and deposits.
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('shows the comment of a stock update', () => {
      setup(tx(stockUpdate, { comment: 'Leverans' }));
      expect(screen.getByText('Leverans')).toBeInTheDocument();
    });
  });

  describe('unknown type', () => {
    it('says so instead of listing details', () => {
      setup(tx(base, { type: 'refund' }));
      expect(screen.getByText('Unknown transaction type')).toBeInTheDocument();
    });
  });

  describe('removed transactions', () => {
    it('has no delete button', () => {
      setup(tx(purchase, { removed: true }));
      expect(screen.queryByRole('button', { name: 'Stryk Transaktion' })).not.toBeInTheDocument();
    });

    it('still shows the details', () => {
      setup(tx(purchase, { removed: true }));
      expect(listItem('Läsk')).toBeInTheDocument();
      expect(row('Utförd av:')).toHaveTextContent('Bob');
    });

    it('applies the transaction-popup class', () => {
      setup(tx(purchase, { removed: true }));
      expect(document.querySelector('.popup-window')).toHaveClass('transaction-popup');
    });

    it('can be closed with the X button', async () => {
      const { closeModal } = setup(tx(purchase, { removed: true }));
      await userEvent.click(screen.getByRole('button', { name: 'close' }));
      expect(closeModal).toHaveBeenCalledTimes(1);
    });

    it('has a title that starts with "Struken"', () => {
      setup(tx(purchase, { removed: true }));
      expect(screen.getByRole('heading', { level: 2 }).textContent).toMatch(/^Struken/);
    });

    // Fails on the current code: the title is "Struken" + the raw type, e.g. "Strukenpurchase".
    it.fails('separates "Struken" from the type with a space', () => {
      setup(tx(purchase, { removed: true }));
      expect(screen.getByRole('heading', { name: /^Struken /i })).toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    it('opens a confirmation instead of deleting straight away', async () => {
      const { openModal, removeTransaction, closeModal } = setup(purchase);
      await userEvent.click(deleteButton());

      expect(openModal).toHaveBeenCalledTimes(1);
      expect(removeTransaction).not.toHaveBeenCalled();
      expect(closeModal).not.toHaveBeenCalled();
    });

    it('asks the user to confirm', async () => {
      await openConfirmDialog(purchase);
      expect(screen.getByRole('heading', { name: 'Stryk Transaktion' })).toBeInTheDocument();
      expect(
        screen.getByText('Är du säker på att du vill stryka denna transaktion?')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Stryk' })).toBeInTheDocument();
    });

    it('removes the transaction and closes the modal when confirmed', async () => {
      const { removeTransaction, closeModal } = await openConfirmDialog(purchase);
      await userEvent.click(screen.getByRole('button', { name: 'Stryk' }));

      await waitFor(() => expect(closeModal).toHaveBeenCalledTimes(1));
      expect(removeTransaction).toHaveBeenCalledTimes(1);
      expect(removeTransaction).toHaveBeenCalledWith(5);
    });

    it('keeps the modal open when the removal fails', async () => {
      const { removeTransaction, closeModal } = await openConfirmDialog(purchase, {
        removeResult: false,
      });
      await userEvent.click(screen.getByRole('button', { name: 'Stryk' }));

      await waitFor(() => expect(removeTransaction).toHaveBeenCalledWith(5));
      await act(async () => {});
      expect(closeModal).not.toHaveBeenCalled();
    });

    it('does not remove anything when the confirmation is closed with the X', async () => {
      const { removeTransaction } = await openConfirmDialog(purchase);
      await userEvent.click(screen.getByRole('button', { name: 'close' }));
      expect(removeTransaction).not.toHaveBeenCalled();
    });
  });
});
