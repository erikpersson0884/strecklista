// src/tests/pages/TransactionsPage.test.tsx
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import TransactionsPage from '@/pages/transactionsPage/TransactionsPage'; // adjust path
import TransactionPopup from '@/components/transactionPopup/TransactionPopup';
import useTransactionsContext from '@/contexts/TransactionsContext';
import useUsersContext from '@/contexts/UsersContext';
import useModalContext from '@/contexts/ModalContext';

import shoppingCartIcon from '@/assets/images/shoppingcart.svg';
import stockIcon from '@/assets/images/stock-add.svg';
import walletIcon from '@/assets/images/wallet.svg';

vi.mock('@/contexts/TransactionsContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

// Adjust these three paths to where the real files live
vi.mock('@/pages/loadingPage/LoadingPage', () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));
vi.mock('@/pages/transactionsPage/Filter/Filter', () => ({
  default: ({ isVisible, hideFilters }: { isVisible: boolean; hideFilters: () => void }) => (
    <div data-testid="filter" data-visible={String(isVisible)}>
      <button onClick={hideFilters}>Dölj filter</button>
    </div>
  ),
}));
vi.mock('@/components/transactionPopup/TransactionPopup', () => ({
  default: ({ transaction }: { transaction: { id: number } }) => (
    <div data-testid="popup">{transaction.id}</div>
  ),
}));

// ---------- test data ----------
const alice = { id: 7, nick: 'Alice' };
const bob = { id: 8, nick: 'Bob' };
const users: Record<number, unknown> = { 7: alice, 8: bob };

// Built from local parts, so the labels don't depend on the machine's time zone
const at = (day: number, hour = 12) => new Date(2025, 0, day, hour).getTime();

const purchase = {
  id: 1,
  type: 'purchase',
  createdTime: at(5, 15),
  createdBy: { type: 'user', id: 8 }, // the shape this component reads
  createdFor: 7,
  total: 36,
  items: [],
  removed: false,
};
const deposit = {
  id: 2,
  type: 'deposit',
  createdTime: at(5, 9),
  createdBy: { type: 'user', id: 8 },
  createdFor: 7,
  total: 500,
  removed: false,
};
const stockUpdate = {
  id: 3,
  type: 'stockUpdate',
  createdTime: at(4),
  createdBy: { type: 'user', id: 8 },
  items: [
    { id: 1, name: 'Läsk', before: 5, after: 20 },
    { id: 2, name: 'Kaffe', before: 10, after: 4 },
  ],
  removed: false,
};
const refund = {
  id: 4,
  type: 'refund',
  createdTime: at(3),
  createdBy: { type: 'user', id: 8 },
  removed: false,
};

const tx = (t: object, over: Record<string, unknown> = {}) => ({ ...t, ...over }) as any;

// ---------- setup ----------
type Setup = {
  transactions?: unknown[];
  transactionsCtx?: Record<string, unknown>;
  usersCtx?: Record<string, unknown>;
  lookup?: (id: number) => unknown;
};

function setup(o: Setup = {}) {
  const transactionsCtx = {
    isLoadingTransactions: false,
    filteredTransactions: o.transactions ?? [purchase, deposit, stockUpdate],
    setFilters: vi.fn(),
    hasNextPage: true,
    hasPrevPage: true,
    getNextTransactions: vi.fn(),
    getPrevTransactions: vi.fn(),
    transactionsPageNumber: 3,
    ...o.transactionsCtx,
  };
  const getUserFromUserId = vi.fn(o.lookup ?? ((id: number) => users[id]));
  const usersCtx = { users: [alice, bob], getUserFromUserId, ...o.usersCtx };
  const openModal = vi.fn();

  vi.mocked(useTransactionsContext).mockReturnValue(transactionsCtx as any);
  vi.mocked(useUsersContext).mockReturnValue(usersCtx as any);
  vi.mocked(useModalContext).mockReturnValue({ openModal } as any);

  const view = render(<TransactionsPage />);
  return {
    transactionsCtx,
    usersCtx,
    getUserFromUserId,
    openModal,
    rerender: () => view.rerender(<TransactionsPage />),
  };
}

// ---------- helpers ----------
const rows = () => screen.queryAllByRole('listitem');
const searchInput = () => screen.getByPlaceholderText('Sök transaktioner...');
const filterToggle = () => screen.getByRole('button', { name: 'Filter' });
const filterPanel = () => screen.getByTestId('filter');
const prevButton = () => screen.getByRole('button', { name: /Föregående/ });
const nextButton = () => screen.getByRole('button', { name: /Nästa/ });

const headers = () =>
  Array.from(document.querySelectorAll('.transaction-date-header')).map((h) => h.textContent);
const groupRows = (label: string) =>
  within(screen.getByText(label).closest('.transaction-group') as HTMLElement).getAllByRole('listitem');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TransactionsPage', () => {
  describe('loading', () => {
    it('shows only the loading page while transactions load', () => {
      setup({ transactionsCtx: { isLoadingTransactions: true } });
      expect(screen.getByText('Hämtar transaktioner...')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Sök transaktioner...')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter')).not.toBeInTheDocument();
    });

    it('renders the page when users are missing but the filters are closed', () => {
      setup({ usersCtx: { users: undefined } });
      expect(searchInput()).toBeInTheDocument();
      expect(screen.queryByText('Hämtar användare...')).not.toBeInTheDocument();
    });

    it('shows a loading page when the filters are opened before users have loaded', async () => {
      setup({ usersCtx: { users: undefined } });
      await userEvent.click(filterToggle());

      expect(screen.getByText('Hämtar användare...')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Sök transaktioner...')).not.toBeInTheDocument();
    });

    it('comes back with the filters still open once users have loaded', async () => {
      const { usersCtx, rerender } = setup({ usersCtx: { users: undefined } });
      await userEvent.click(filterToggle());

      vi.mocked(useUsersContext).mockReturnValue({ ...usersCtx, users: [alice, bob] } as any);
      rerender();

      expect(screen.queryByText('Hämtar användare...')).not.toBeInTheDocument();
      expect(filterPanel()).toHaveAttribute('data-visible', 'true');
    });
  });

  describe('search and filters', () => {
    it('starts with the filters hidden', () => {
      setup();
      expect(filterPanel()).toHaveAttribute('data-visible', 'false');
    });

    it('updates only the search query when the user types', () => {
      const { transactionsCtx } = setup();
      fireEvent.change(searchInput(), { target: { value: 'läsk' } });

      expect(transactionsCtx.setFilters).toHaveBeenCalledTimes(1);
      const updater = transactionsCtx.setFilters.mock.calls[0][0];
      expect(updater({ type: 'purchase', searchQuery: '' })).toEqual({
        type: 'purchase',
        searchQuery: 'läsk',
      });
    });

    it('opens and closes the filters with the filter button', async () => {
      setup();
      await userEvent.click(filterToggle());
      expect(filterPanel()).toHaveAttribute('data-visible', 'true');

      await userEvent.click(filterToggle());
      expect(filterPanel()).toHaveAttribute('data-visible', 'false');
    });

    it('closes the filters when the filter panel asks to be hidden', async () => {
      setup();
      await userEvent.click(filterToggle());
      await userEvent.click(screen.getByRole('button', { name: 'Dölj filter' }));
      expect(filterPanel()).toHaveAttribute('data-visible', 'false');
    });

    it('keeps the search bar visible while the filters are open', async () => {
      setup();
      await userEvent.click(filterToggle());
      expect(searchInput()).toBeInTheDocument();
    });
  });

  describe('transaction list', () => {
    it('shows a message when there are no transactions', () => {
      setup({ transactions: [] });
      expect(screen.getByText('Inga transaktioner hittades.')).toBeInTheDocument();
      expect(rows()).toHaveLength(0);
      expect(headers()).toEqual([]);
    });

    it('groups transactions under one Swedish date header per day, in the given order', () => {
      setup();
      expect(headers()).toEqual(['5 januari 2025', '4 januari 2025']);
      expect(groupRows('5 januari 2025')).toHaveLength(2);
      expect(groupRows('4 januari 2025')).toHaveLength(1);
    });

    it('puts non-adjacent transactions from the same day in one group', () => {
      setup({ transactions: [purchase, stockUpdate, deposit] });
      expect(headers()).toEqual(['5 januari 2025', '4 januari 2025']);
      expect(groupRows('5 januari 2025')).toHaveLength(2);
    });

    it('accepts Date objects as well as timestamps', () => {
      setup({ transactions: [tx(purchase, { createdTime: new Date(2025, 11, 24, 18, 30) })] });
      expect(headers()).toEqual(['24 december 2025']);
    });

    it('renders one row per transaction', () => {
      setup();
      expect(rows()).toHaveLength(3);
    });

    // Fails on the current code: an invalid date becomes the header "Invalid Date".
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('does not show "Invalid Date" as a group header', () => {
      setup({ transactions: [tx(purchase, { createdTime: 'garbage' })] });
      expect(headers()).not.toContain('Invalid Date');
    });
  });

  describe('transaction preview', () => {
    describe('type and icon', () => {
      it.each([
        ['purchase', purchase, 'Köp', shoppingCartIcon],
        ['deposit', deposit, 'Insättning', walletIcon],
        ['stockUpdate', stockUpdate, 'Lageruppdatering', stockIcon],
        ['an unknown type', refund, 'Okänd', '?'],
      ])('shows the label and icon for %s', (_name, transaction, label, icon) => {
        setup({ transactions: [transaction] });
        const row = within(rows()[0]);

        expect(row.getByText(label)).toBeInTheDocument();
        expect(row.getByAltText('Transaktion')).toHaveAttribute('src', icon);
      });

      it('adds a type class to the icon wrapper', () => {
        setup({ transactions: [purchase] });
        expect(rows()[0].querySelector('.transaction-icon')).toHaveClass('transaction-icon-purchase');
      });
    });

    describe('removed transactions', () => {
      it('marks a removed transaction', () => {
        setup({ transactions: [tx(purchase, { removed: true })] });
        expect(rows()[0]).toHaveClass('transaction-preview', 'removed-transaction');
      });

      it('does not mark an active transaction', () => {
        setup({ transactions: [purchase] });
        expect(rows()[0]).not.toHaveClass('removed-transaction');
      });
    });

    describe('amount', () => {
      it('shows a purchase as a negative amount', () => {
        setup({ transactions: [purchase] });
        const amount = within(rows()[0]).getByText('-36 kr');
        expect(amount).toHaveClass('transaction-amount-negative');
      });

      it('shows a deposit as a positive amount', () => {
        setup({ transactions: [deposit] });
        const amount = within(rows()[0]).getByText('+500 kr');
        expect(amount).toHaveClass('transaction-amount-positive');
      });

      it('shows the number of items for a stock update', () => {
        setup({ transactions: [stockUpdate] });
        const amount = within(rows()[0]).getByText('2 st');
        expect(amount).toHaveClass('transaction-amount-neutral');
      });

      it('shows no amount for an unknown type', () => {
        setup({ transactions: [refund] });
        expect(rows()[0].querySelector('.transaction-amount')).toBeNull();
      });
    });

    describe('user', () => {
      it('shows the account a purchase was made for, not who created it', () => {
        const { getUserFromUserId } = setup({ transactions: [purchase] });
        expect(within(rows()[0]).getByText('Alice')).toBeInTheDocument();
        expect(within(rows()[0]).queryByText('Bob')).not.toBeInTheDocument();
        expect(getUserFromUserId).toHaveBeenCalledWith(7);
      });

      it('shows the account a deposit was made for', () => {
        setup({ transactions: [deposit] });
        expect(within(rows()[0]).getByText('Alice')).toBeInTheDocument();
      });

      it('still shows the account when the creator of a purchase is unknown', () => {
        setup({ transactions: [tx(purchase, { createdBy: null })] });
        expect(within(rows()[0]).getByText('Alice')).toBeInTheDocument();
      });

      it('shows the creator of a stock update', () => {
        const { getUserFromUserId } = setup({ transactions: [stockUpdate] });
        expect(within(rows()[0]).getByText('Bob')).toBeInTheDocument();
        expect(getUserFromUserId).toHaveBeenCalledWith(8);
      });

      it('shows the client id when a client created a stock update', () => {
        setup({ transactions: [tx(stockUpdate, { createdBy: { type: 'client', id: 3 } })] });
        expect(within(rows()[0]).getByText('client id:3')).toBeInTheDocument();
      });

      it.each([undefined, null])('shows an unknown creator when createdBy is %s', (createdBy) => {
        setup({ transactions: [tx(stockUpdate, { createdBy })] });
        expect(
          within(rows()[0]).getByText('Okänd (förmodligen borttagen användare eller klient)')
        ).toBeInTheDocument();
      });

      // Fails on the current code: a string result from the lookup has no .nick, so the name is blank.
      it.fails('shows the fallback name when the lookup returns a string', () => {
        setup({ transactions: [purchase], lookup: () => 'Borttagen användare' });
        expect(within(rows()[0]).getByText('Borttagen användare')).toBeInTheDocument();
      });
    });

    describe('opening the popup', () => {
      it('opens the transaction popup when the row is clicked', async () => {
        const { openModal } = setup({ transactions: [purchase] });
        await userEvent.click(screen.getByText('Köp'));

        expect(openModal).toHaveBeenCalledTimes(1);
        const element = openModal.mock.calls[0][0];
        expect(element.type).toBe(TransactionPopup);
        expect(element.props.transaction).toBe(purchase);
      });

      it('opens the popup for the clicked row, not the first', async () => {
        const { openModal } = setup();
        await userEvent.click(within(rows()[2]).getByText('Lageruppdatering'));

        expect(openModal.mock.calls[0][0].props.transaction).toBe(stockUpdate);
      });

      it('does not open anything until a row is clicked', () => {
        const { openModal } = setup();
        expect(openModal).not.toHaveBeenCalled();
      });
    });
  });

  describe('pagination', () => {
    it('shows the current page number', () => {
      setup({ transactionsCtx: { transactionsPageNumber: 4 } });
      expect(document.querySelector('.page-number')).toHaveTextContent('4');
    });

    it('enables both buttons when there are pages on both sides', () => {
      setup();
      expect(prevButton()).toBeEnabled();
      expect(nextButton()).toBeEnabled();
    });

    it('disables "Föregående" on the first page', () => {
      setup({ transactionsCtx: { hasPrevPage: false } });
      expect(prevButton()).toBeDisabled();
      expect(nextButton()).toBeEnabled();
    });

    it('disables "Nästa" on the last page', () => {
      setup({ transactionsCtx: { hasNextPage: false } });
      expect(nextButton()).toBeDisabled();
      expect(prevButton()).toBeEnabled();
    });

    it('goes to the next page', async () => {
      const { transactionsCtx } = setup();
      await userEvent.click(nextButton());
      expect(transactionsCtx.getNextTransactions).toHaveBeenCalledTimes(1);
      expect(transactionsCtx.getPrevTransactions).not.toHaveBeenCalled();
    });

    it('goes to the previous page', async () => {
      const { transactionsCtx } = setup();
      await userEvent.click(prevButton());
      expect(transactionsCtx.getPrevTransactions).toHaveBeenCalledTimes(1);
      expect(transactionsCtx.getNextTransactions).not.toHaveBeenCalled();
    });

    it('does nothing when a disabled button is clicked', async () => {
      const { transactionsCtx } = setup({ transactionsCtx: { hasNextPage: false, hasPrevPage: false } });
      await userEvent.click(nextButton());
      await userEvent.click(prevButton());
      expect(transactionsCtx.getNextTransactions).not.toHaveBeenCalled();
      expect(transactionsCtx.getPrevTransactions).not.toHaveBeenCalled();
    });

    it('stays visible when there are no transactions', () => {
      setup({ transactions: [] });
      expect(prevButton()).toBeInTheDocument();
      expect(nextButton()).toBeInTheDocument();
    });
  });
});