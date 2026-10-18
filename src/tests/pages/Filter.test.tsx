// src/tests/pages/Filter.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import Filter from '@/pages/transactionsPage/Filter/Filter'; // adjust path
import useUsersContext from '@/contexts/UsersContext';
import useTransactionsContext from '@/contexts/TransactionsContext';

vi.mock('@/contexts/UsersContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/TransactionsContext', () => ({ default: vi.fn() }));
// Stand-in for Switch: a checkbox that reports changes like the real one must (adjust path)
vi.mock('@/components/switch/Switch', () => ({
  default: ({ id, checked, onChange }: any) => (
    <input type="checkbox" id={id} checked={checked} onChange={onChange} />
  ),
}));

// ---------- test data ----------
const alice = { id: 7, nick: 'Alice' };
const bob = { id: 8, nick: 'Bob' };

const defaultFilters = {
  userId: 'all',
  transactionType: 'all',
  startDate: null,
  endDate: null,
  showRemovedTransactions: false,
};

// An arbitrary earlier state, to prove each control leaves the other fields alone
const previous = {
  userId: '7',
  transactionType: 'deposit',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  showRemovedTransactions: true,
  searchQuery: 'läsk',
};

// ---------- setup ----------
type Setup = {
  filters?: Record<string, unknown>;
  users?: unknown[];
  isVisible?: boolean;
};

function setup(o: Setup = {}) {
  const results: Record<string, unknown>[] = [];
  const ctx = {
    filters: { ...defaultFilters, ...o.filters },
    setFilters: vi.fn((updater: (f: typeof previous) => Record<string, unknown>) => {
      results.push(updater(previous)); // runs while the event still holds the new value
    }),
    resetFilters: vi.fn(),
    results,
  };
  const hideFilters = vi.fn();

  vi.mocked(useTransactionsContext).mockReturnValue(ctx as any);
  vi.mocked(useUsersContext).mockReturnValue({ users: o.users ?? [alice, bob] } as any);

  const { container } = render(<Filter isVisible={o.isVisible ?? true} hideFilters={hideFilters} />);
  return { ctx, hideFilters, container };
}

// Runs the updater that was passed to setFilters against a previous state
const applied = (ctx: { setFilters: ReturnType<typeof vi.fn>; results: unknown[] }) => {
  expect(ctx.setFilters).toHaveBeenCalledTimes(1);
  return ctx.results[0];
};

// ---------- helpers ----------
const userSelect = () => screen.getByLabelText('Användare:') as HTMLSelectElement;
const typeSelect = () => screen.getByLabelText('Typ:') as HTMLSelectElement;
const startInput = () => screen.getByLabelText('Från datum:') as HTMLInputElement;
const endInput = () => screen.getByLabelText('Till datum:') as HTMLInputElement;
const deletedSwitch = () => screen.getByLabelText('Visa strukna transaktioner:') as HTMLInputElement;
const optionTexts = (select: HTMLElement) =>
  Array.from((select as HTMLSelectElement).options).map((o) => o.textContent);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Filter', () => {
  describe('visibility', () => {
    it('has the visible class when isVisible is true', () => {
      const { container } = setup({ isVisible: true });
      expect(container.firstChild).toHaveClass('filter-div', 'visible');
    });

    it('does not have the visible class when isVisible is false', () => {
      const { container } = setup({ isVisible: false });
      expect(container.firstChild).toHaveClass('filter-div');
      expect(container.firstChild).not.toHaveClass('visible');
    });

    it('renders every control even when hidden', () => {
      setup({ isVisible: false });
      expect(userSelect()).toBeInTheDocument();
      expect(typeSelect()).toBeInTheDocument();
      expect(startInput()).toBeInTheDocument();
      expect(endInput()).toBeInTheDocument();
      expect(deletedSwitch()).toBeInTheDocument();
    });
  });

  describe('user filter', () => {
    it('lists "Alla" followed by every user', () => {
      setup();
      expect(optionTexts(userSelect())).toEqual(['Alla', 'Alice', 'Bob']);
    });

    it('lists only "Alla" when there are no users', () => {
      setup({ users: [] });
      expect(optionTexts(userSelect())).toEqual(['Alla']);
    });

    it('selects "Alla" by default', () => {
      setup();
      expect(userSelect()).toHaveValue('all');
    });

    it('selects the user from the filters', () => {
      setup({ filters: { userId: '8' } });
      expect(userSelect()).toHaveValue('8');
    });

    it('selects the user when the filter holds a number', () => {
      setup({ filters: { userId: 8 } });
      expect(userSelect()).toHaveValue('8');
    });

    it('sets only the user id when another user is chosen', async () => {
      const { ctx } = setup();
      await userEvent.selectOptions(userSelect(), 'Bob');
      expect(applied(ctx)).toEqual({ ...previous, userId: '8' });
    });

    it('sets the user id to "all" when "Alla" is chosen', async () => {
      const { ctx } = setup({ filters: { userId: '8' } });
      await userEvent.selectOptions(userSelect(), 'Alla');
      expect(applied(ctx)).toEqual({ ...previous, userId: 'all' });
    });
  });

  describe('type filter', () => {
    it('lists all transaction types', () => {
      setup();
      expect(optionTexts(typeSelect())).toEqual(['Alla', 'Köp', 'Insättning', 'Lageruppdatering']);
    });

    it('selects "Alla" by default', () => {
      setup();
      expect(typeSelect()).toHaveValue('all');
    });

    it.each([
      ['purchase', 'Köp'],
      ['deposit', 'Insättning'],
      ['stockUpdate', 'Lageruppdatering'],
    ])('selects %s from the filters', (value) => {
      setup({ filters: { transactionType: value } });
      expect(typeSelect()).toHaveValue(value);
    });

    it.each([
      ['purchase', 'Köp'],
      ['deposit', 'Insättning'],
      ['stockUpdate', 'Lageruppdatering'],
      ['all', 'Alla'],
    ])('sets the type to %s when "%s" is chosen', async (value, label) => {
      const { ctx } = setup({ filters: { transactionType: value === 'all' ? 'purchase' : 'all' } });
      await userEvent.selectOptions(typeSelect(), label);
      expect(applied(ctx)).toEqual({ ...previous, transactionType: value });
    });
  });

  describe('date filters', () => {
    it('start with empty date inputs', () => {
      setup();
      expect(startInput()).toHaveValue('');
      expect(endInput()).toHaveValue('');
    });

    it('show the dates from the filters', () => {
      setup({ filters: { startDate: '2025-01-05', endDate: '2025-02-10' } });
      expect(startInput()).toHaveValue('2025-01-05');
      expect(endInput()).toHaveValue('2025-02-10');
    });

    it('use date inputs', () => {
      setup();
      expect(startInput()).toHaveAttribute('type', 'date');
      expect(endInput()).toHaveAttribute('type', 'date');
    });

    it('set only the start date when it changes', () => {
      const { ctx } = setup();
      fireEvent.change(startInput(), { target: { value: '2025-03-04' } });
      expect(applied(ctx)).toEqual({ ...previous, startDate: '2025-03-04' });
    });

    it('set only the end date when it changes', () => {
      const { ctx } = setup();
      fireEvent.change(endInput(), { target: { value: '2025-03-04' } });
      expect(applied(ctx)).toEqual({ ...previous, endDate: '2025-03-04' });
    });

    it('turn a cleared start date into null', () => {
      const { ctx } = setup({ filters: { startDate: '2025-01-05' } });
      fireEvent.change(startInput(), { target: { value: '' } });
      expect(applied(ctx)).toEqual({ ...previous, startDate: null });
    });

    it('turn a cleared end date into null', () => {
      const { ctx } = setup({ filters: { endDate: '2025-01-05' } });
      fireEvent.change(endInput(), { target: { value: '' } });
      expect(applied(ctx)).toEqual({ ...previous, endDate: null });
    });
  });

  describe('deleted transactions switch', () => {
    it('is unchecked when deleted transactions are hidden', () => {
      setup({ filters: { showRemovedTransactions: false } });
      expect(deletedSwitch()).not.toBeChecked();
    });

    it('is checked when deleted transactions are shown', () => {
      setup({ filters: { showRemovedTransactions: true } });
      expect(deletedSwitch()).toBeChecked();
    });

    it('turns showing on when checked', async () => {
      const { ctx } = setup({ filters: { showRemovedTransactions: false } });
      await userEvent.click(deletedSwitch());
      expect(applied(ctx)).toEqual({ ...previous, showRemovedTransactions: true });
    });

    it('turns showing off when unchecked', async () => {
      const { ctx } = setup({ filters: { showRemovedTransactions: true } });
      await userEvent.click(deletedSwitch());
      expect(applied(ctx)).toEqual({ ...previous, showRemovedTransactions: false });
    });

    it('sits in a wrapper with the deleted-transactions-filter class', () => {
      setup();
      expect(deletedSwitch().closest('.inputdiv')).toHaveClass('deleted-transactions-filter');
    });
  });

  describe('footer', () => {
    it('resets the filters', async () => {
      const { ctx, hideFilters } = setup();
      await userEvent.click(screen.getByRole('button', { name: 'Återställ filter' }));

      expect(ctx.resetFilters).toHaveBeenCalledTimes(1);
      expect(ctx.setFilters).not.toHaveBeenCalled();
      expect(hideFilters).not.toHaveBeenCalled();
    });

    it('hides the filters', async () => {
      const { ctx, hideFilters } = setup();
      await userEvent.click(screen.getByRole('button', { name: 'Stäng filter' }));

      expect(hideFilters).toHaveBeenCalledTimes(1);
      expect(ctx.resetFilters).not.toHaveBeenCalled();
    });

    it('does nothing until a button is clicked', () => {
      const { ctx, hideFilters } = setup();
      expect(ctx.resetFilters).not.toHaveBeenCalled();
      expect(ctx.setFilters).not.toHaveBeenCalled();
      expect(hideFilters).not.toHaveBeenCalled();
    });
  });

  // Fails on the current code: the user filter has no guard for a missing users list.
  // `it.fails` passes while the bug exists; switch it to `it` once fixed.
  it.fails('does not crash while the users have not loaded', () => {
    setup({ users: undefined as any });
    // setup() falls back to [alice, bob] for undefined, so mock it directly:
    vi.mocked(useUsersContext).mockReturnValue({ users: undefined } as any);
    render(<Filter isVisible hideFilters={vi.fn()} />);
    expect(screen.getAllByLabelText('Användare:').length).toBeGreaterThan(0);
  });
});
