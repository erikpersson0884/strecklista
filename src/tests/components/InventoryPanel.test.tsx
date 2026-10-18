// src/tests/components/InventoryPanel.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import InventoryPanel from '@/components/inventoryPanel/InventoryPanel'; // adjust path
import useInventoryContext from '@/contexts/InventoryContext';
import { useCartContext } from '@/contexts/CartContext';

vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ useCartContext: vi.fn() }));
vi.mock('@/components/scannerComponent/ScannerComponent', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="scanner" className={className} />
  ),
}));
vi.mock('@/components/icon/ProductIcon', () => ({
  default: ({ item }: { item: { name: string } }) => (
    <span data-testid="icon" data-item={item.name} />
  ),
}));
vi.mock('react-barcode', () => ({
  default: (props: { value: string; displayValue?: boolean; format?: string; className?: string }) => (
    <span
      data-testid="barcode"
      data-value={props.value}
      data-display-value={String(props.displayValue)}
      data-format={props.format}
      className={props.className}
    />
  ),
}));

// ---------- test data ----------
const make = (over: Record<string, unknown>) => ({
  id: 'x',
  name: 'Item',
  available: true,
  amountInStock: 5,
  timesPurchased: 0,
  externalId: undefined,
  ...over,
});

const lask = make({ id: 'i1', name: 'Läsk', timesPurchased: 10 });
const kaffe = make({ id: 'i2', name: 'Kaffe', timesPurchased: 30 });
const cider = make({ id: 'i3', name: 'Cider', timesPurchased: 5, externalId: 'ext-cider' });
const chips = make({ id: 'i4', name: 'Chips', timesPurchased: 1, externalId: 'ext-chips' });

const addItemToCart = vi.fn();

function setup(items: unknown[]) {
  vi.mocked(useInventoryContext).mockReturnValue({ items } as any);
  vi.mocked(useCartContext).mockReturnValue({ addItemToCart } as any);
  render(<InventoryPanel />);
}

const rows = () => screen.queryAllByRole('listitem');
const names = () => rows().map((r) => r.querySelector('p')!.textContent);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('InventoryPanel', () => {
  describe('rendering', () => {
    it('shows the section label', () => {
      setup([]);
      expect(screen.getByText('STRÄCKA VAD?')).toBeInTheDocument();
    });

    it('renders the scanner with the scanner class', () => {
      setup([]);
      expect(screen.getByTestId('scanner')).toHaveClass('scanner');
    });

    it('renders no rows when there are no items', () => {
      setup([]);
      expect(rows()).toHaveLength(0);
    });

    it('shows the icon, name and stock for each item', () => {
      setup([lask]);
      const row = rows()[0];
      expect(row).toHaveClass('inventory-item');
      expect(row.querySelector('[data-testid="icon"]')).toHaveAttribute('data-item', 'Läsk');
      expect(row).toHaveTextContent('Läsk');
      expect(row).toHaveTextContent('5 st kvar');
    });
  });

  describe('stock text', () => {
    it.each([
      [0, '0 st kvar'],
      [-3, '0 st kvar'],
      [12, '12 st kvar'],
    ])('shows %i in stock as "%s"', (amountInStock, text) => {
      setup([make({ id: 'a', name: 'Vara', amountInStock })]);
      expect(rows()[0]).toHaveTextContent(text);
    });
  });

  describe('filtering', () => {
    it('hides unavailable items', () => {
      setup([lask, make({ id: 'u', name: 'Dold', available: false })]);
      expect(names()).toEqual(['Läsk']);
    });

    it('hides items where available is not exactly true', () => {
      setup([lask, make({ id: 'u', name: 'Okänd', available: undefined })]);
      expect(names()).toEqual(['Läsk']);
    });

    it('still shows available items that are out of stock', () => {
      setup([make({ id: 'a', name: 'Slut', amountInStock: 0 })]);
      expect(names()).toEqual(['Slut']);
    });
  });

  describe('sorting', () => {
    it('puts items with a barcode first', () => {
      setup([lask, cider, kaffe, chips]);
      expect(names().slice(0, 2).sort()).toEqual(['Chips', 'Cider']);
    });

    it('sorts items without a barcode by times purchased, most first', () => {
      setup([lask, kaffe, make({ id: 'z', name: 'Nytt', timesPurchased: 0 })]);
      expect(names()).toEqual(['Kaffe', 'Läsk', 'Nytt']);
    });

    it('sorts items with a barcode by times purchased, most first', () => {
      setup([chips, cider]);
      expect(names()).toEqual(['Cider', 'Chips']);
    });

    it('puts a barcode item first even when it was purchased less', () => {
      setup([kaffe, chips]); // kaffe: 30 purchases, no barcode; chips: 1 purchase, barcode
      expect(names()).toEqual(['Chips', 'Kaffe']);
    });

    it('gives the same order whichever way the items arrive', () => {
      setup([kaffe, chips, lask, cider]);
      expect(names()).toEqual(['Cider', 'Chips', 'Kaffe', 'Läsk']);
    });

    it('treats an empty external id as no barcode', () => {
      setup([make({ id: 'e', name: 'Tom', externalId: '', timesPurchased: 1 }), kaffe]);
      expect(names()).toEqual(['Kaffe', 'Tom']);
    });

    it('does not reorder the array it was given', () => {
      const original = [lask, cider, kaffe];
      setup(original);
      expect(original).toEqual([lask, cider, kaffe]);
    });
  });

  describe('barcodes', () => {
    it('renders a hidden-text CODE128 barcode for items with an external id', () => {
      setup([cider]);
      const barcode = screen.getByTestId('barcode');
      expect(barcode).toHaveAttribute('data-value', 'ext-cider');
      expect(barcode).toHaveAttribute('data-format', 'CODE128');
      expect(barcode).toHaveAttribute('data-display-value', 'false');
      expect(barcode).toHaveClass('barcode');
    });

    it('renders no barcode for items without an external id', () => {
      setup([lask]);
      expect(screen.queryByTestId('barcode')).not.toBeInTheDocument();
    });

    it('renders one barcode per item that has an external id', () => {
      setup([lask, cider, chips]);
      expect(screen.getAllByTestId('barcode')).toHaveLength(2);
    });
  });

  describe('adding to the cart', () => {
    it('adds the item when its row is clicked', async () => {
      setup([lask, kaffe]);
      await userEvent.click(screen.getByText('Läsk'));

      expect(addItemToCart).toHaveBeenCalledTimes(1);
      expect(addItemToCart).toHaveBeenCalledWith(lask);
    });

    it('adds the right item when the stock text is clicked', async () => {
      setup([lask, kaffe]);
      await userEvent.click(screen.getAllByText(/st kvar/)[0]); // kaffe is sorted first
      expect(addItemToCart).toHaveBeenCalledWith(kaffe);
    });

    it('adds the item again on every click', async () => {
      setup([lask]);
      await userEvent.click(screen.getByText('Läsk'));
      await userEvent.click(screen.getByText('Läsk'));
      expect(addItemToCart).toHaveBeenCalledTimes(2);
    });

    it('does nothing until a row is clicked', () => {
      setup([lask]);
      expect(addItemToCart).not.toHaveBeenCalled();
    });
  });
});