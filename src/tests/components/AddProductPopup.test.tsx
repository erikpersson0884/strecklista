// src/tests/components/AddProductPopup.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AddProductPopup from '@/components/addProductPopup/AddProductPopup'; // adjust path
import useInventoryContext from '@/contexts/InventoryContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
// Switch has no props wired up here, so keep it out of the picture (adjust path)
vi.mock('@/components/switch/Switch', () => ({
  default: ({ id }: { id: string }) => <input type="checkbox" id={id} />,
}));

const closeModal = vi.fn();
const addItem = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  addItem.mockResolvedValue({ id: 1 });
  vi.mocked(useInventoryContext).mockReturnValue({ addItem } as any);
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
});

const nameInput = () => screen.getByLabelText('Varunamn');
const priceInput = () => screen.getByLabelText('Pris (Internt)');
const stockInput = () => screen.getByLabelText('Antal i lager');
const iconInput = () => screen.getByLabelText('Bild URL');
const submit = () => userEvent.click(screen.getByRole('button', { name: 'Lägg till' }));

describe('AddProductPopup', () => {
  it('renders the title and all fields with default values', () => {
    render(<AddProductPopup />);

    expect(screen.getByRole('heading', { name: 'Lägg till vara' })).toBeInTheDocument();
    expect(nameInput()).toHaveValue('');
    expect(priceInput()).toHaveValue('0');
    expect(stockInput()).toHaveValue('0');
    expect(iconInput()).toHaveValue('');
  });

  it('updates the text fields as the user types', async () => {
    render(<AddProductPopup />);
    await userEvent.type(nameInput(), 'Läsk');
    await userEvent.type(iconInput(), 'https://example.com/lask.png');

    expect(nameInput()).toHaveValue('Läsk');
    expect(iconInput()).toHaveValue('https://example.com/lask.png');
  });

  it.each([
    ['price', priceInput],
    ['stock', stockInput],
  ])('accepts a valid number in the %s field', (_label, getInput) => {
    render(<AddProductPopup />);
    fireEvent.change(getInput(), { target: { value: '12.5' } });
    expect(getInput()).toHaveValue('12.5');
  });

  it.each([
    ['price', priceInput],
    ['stock', stockInput],
  ])('ignores empty and non-numeric input in the %s field', (_label, getInput) => {
    render(<AddProductPopup />);
    fireEvent.change(getInput(), { target: { value: '5' } });

    fireEvent.change(getInput(), { target: { value: '' } });
    expect(getInput()).toHaveValue('5');

    fireEvent.change(getInput(), { target: { value: 'abc' } });
    expect(getInput()).toHaveValue('5');
  });

  it('calls addItem with the entered name, price and icon', async () => {
    render(<AddProductPopup />);
    await userEvent.type(nameInput(), 'Läsk');
    fireEvent.change(priceInput(), { target: { value: '12.5' } });
    await userEvent.type(iconInput(), 'https://example.com/lask.png');
    await submit();

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem).toHaveBeenCalledWith('Läsk', 12.5, 'https://example.com/lask.png');
  });

  it('closes the modal when the item was added', async () => {
    render(<AddProductPopup />);
    await submit();
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('keeps the modal open and the form filled when adding fails', async () => {
    addItem.mockResolvedValue(null);
    render(<AddProductPopup />);
    await userEvent.type(nameInput(), 'Läsk');
    await submit();

    expect(addItem).toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
    expect(nameInput()).toHaveValue('Läsk');
  });
});