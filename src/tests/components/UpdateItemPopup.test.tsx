// src/tests/components/UpdateItemPopup.test.tsx
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import UpdateItemPopup from '@/components/updateItemPopup/UpdateItemPopup'; // adjust path
import useInventoryContext from '@/contexts/InventoryContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/InventoryContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
// Stand-in for Switch: a checkbox that reports changes like the real one must (adjust path)
vi.mock('@/components/switch/Switch', () => ({
  default: ({ id, name, checked, onChange }: any) => (
    <input type="checkbox" id={id} name={name} checked={checked} onChange={onChange} />
  ),
}));

const item = {
  id: 'i1',
  name: 'Läsk',
  internalPrice: 12,
  icon: 'lask.png',
  available: true,
  externalId: 'ext1',
} as any; // adjust to your Item shape

const updateItem = vi.fn();
const closeModal = vi.fn();

function setup(over: Record<string, unknown> = {}, { updateResult = true } = {}) {
  updateItem.mockResolvedValue(updateResult);
  vi.mocked(useInventoryContext).mockReturnValue({ updateItem } as any);
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
  render(<UpdateItemPopup item={{ ...item, ...over }} />);
}

const nameInput = () => screen.getByLabelText('Namn:') as HTMLInputElement;
const priceInput = () => screen.getByLabelText('Pris:') as HTMLInputElement;
const iconInput = () => screen.getByLabelText('Bildlänk:') as HTMLInputElement;
const externalIdInput = () => screen.getByLabelText('Externt Id:') as HTMLInputElement;
const availableSwitch = () => screen.getByLabelText('Tillgänglig:') as HTMLInputElement;
const acceptButton = () => screen.getByRole('button', { name: 'Update' });

const replaceText = async (el: HTMLElement, text: string) => {
  await userEvent.clear(el);
  await userEvent.type(el, text);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UpdateItemPopup', () => {
  describe('rendering', () => {
    it('shows the title', () => {
      setup();
      expect(screen.getByRole('heading', { name: 'Uppdatera' })).toBeInTheDocument();
    });

    it('prefills every field from the item', () => {
      setup();
      expect(nameInput()).toHaveValue('Läsk');
      expect(priceInput()).toHaveValue(12);
      expect(iconInput()).toHaveValue('lask.png');
      expect(externalIdInput()).toHaveValue('ext1');
      expect(availableSwitch()).toBeChecked();
    });

    it('shows an unavailable item as unchecked', () => {
      setup({ available: false });
      expect(availableSwitch()).not.toBeChecked();
    });
  });

  describe('accept button state', () => {
    it('is disabled while nothing has changed', () => {
      setup();
      expect(acceptButton()).toBeDisabled();
    });

    it.each([
      ['name', () => replaceText(nameInput(), 'Cola')],
      ['icon', () => replaceText(iconInput(), 'cola.png')],
      ['external id', () => replaceText(externalIdInput(), 'ext2')],
      ['availability', () => userEvent.click(availableSwitch())],
      ['price', async () => { fireEvent.change(priceInput(), { target: { value: '15' } }); }],
    ])('is enabled after the %s changes', async (_field, change) => {
      setup();
      await change();
      expect(acceptButton()).toBeEnabled();
    });

    it('is disabled again when a change is undone', async () => {
      setup();
      await userEvent.type(nameInput(), 'x');
      expect(acceptButton()).toBeEnabled();

      await userEvent.type(nameInput(), '{Backspace}');
      expect(nameInput()).toHaveValue('Läsk');
      expect(acceptButton()).toBeDisabled();
    });

    it('is disabled again when the switch is toggled back', async () => {
      setup();
      await userEvent.click(availableSwitch());
      await userEvent.click(availableSwitch());
      expect(acceptButton()).toBeDisabled();
    });

    // Fails on the current code: an empty name can be submitted.
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('is disabled when the name is empty', async () => {
      setup();
      await userEvent.clear(nameInput());
      expect(acceptButton()).toBeDisabled();
    });
  });

  describe('editing', () => {
    it('updates the text fields as the user types', async () => {
      setup();
      await replaceText(nameInput(), 'Cola');
      await replaceText(iconInput(), 'cola.png');
      await replaceText(externalIdInput(), 'ext2');

      expect(nameInput()).toHaveValue('Cola');
      expect(iconInput()).toHaveValue('cola.png');
      expect(externalIdInput()).toHaveValue('ext2');
    });

    it('parses the price as a number, decimals included', () => {
      setup();
      fireEvent.change(priceInput(), { target: { value: '12.5' } });
      expect(priceInput()).toHaveValue(12.5);
    });

    it('treats an empty price as 0', () => {
      setup();
      fireEvent.change(priceInput(), { target: { value: '' } });
      expect(priceInput()).toHaveValue(0);
    });

    it('toggles availability', async () => {
      setup();
      await userEvent.click(availableSwitch());
      expect(availableSwitch()).not.toBeChecked();
    });
  });

  describe('saving', () => {
    const save = () => userEvent.click(acceptButton());

    it('sends only the changed name, plus the price', async () => {
      setup();
      await replaceText(nameInput(), 'Cola');
      await save();

      expect(updateItem).toHaveBeenCalledTimes(1);
      expect(updateItem).toHaveBeenCalledWith('i1', { name: 'Cola', internalPrice: 12 });
    });

    it('sends the new price', async () => {
      setup();
      fireEvent.change(priceInput(), { target: { value: '15' } });
      await save();
      expect(updateItem).toHaveBeenCalledWith('i1', { internalPrice: 15 });
    });

    it('sends the new icon', async () => {
      setup();
      await replaceText(iconInput(), 'cola.png');
      await save();
      expect(updateItem).toHaveBeenCalledWith('i1', { icon: 'cola.png', internalPrice: 12 });
    });

    it('sends the new availability', async () => {
      setup();
      await userEvent.click(availableSwitch());
      await save();
      expect(updateItem).toHaveBeenCalledWith('i1', { available: false, internalPrice: 12 });
    });

    it('sends the new external id', async () => {
      setup();
      await replaceText(externalIdInput(), 'ext2');
      await save();
      expect(updateItem).toHaveBeenCalledWith('i1', { externalId: 'ext2', internalPrice: 12 });
    });

    it('sends every changed field together and leaves out unchanged ones', async () => {
      setup();
      await replaceText(nameInput(), 'Cola');
      fireEvent.change(priceInput(), { target: { value: '15' } });
      await userEvent.click(availableSwitch());
      await save();

      expect(updateItem).toHaveBeenCalledWith('i1', {
        name: 'Cola',
        internalPrice: 15,
        available: false,
      });
    });

    it('closes the modal when the update succeeds', async () => {
      setup();
      await replaceText(nameInput(), 'Cola');
      await save();
      await waitFor(() => expect(closeModal).toHaveBeenCalledTimes(1));
    });

    it('keeps the modal open and the edits when the update fails', async () => {
      setup({}, { updateResult: false });
      await replaceText(nameInput(), 'Cola');
      await save();

      await waitFor(() => expect(updateItem).toHaveBeenCalled());
      await act(async () => {});
      expect(closeModal).not.toHaveBeenCalled();
      expect(nameInput()).toHaveValue('Cola');
    });

    it('does not save when the X button is used', async () => {
      setup();
      await replaceText(nameInput(), 'Cola');
      await userEvent.click(screen.getByRole('button', { name: 'close' }));

      expect(updateItem).not.toHaveBeenCalled();
      expect(closeModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('items with optional fields missing', () => {
    // Fails on the current code: a field that was empty and is typed in and cleared
    // becomes "" instead of undefined, which counts as a change.
    it.fails('treats a cleared optional field as unchanged', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      setup({ externalId: undefined });

      await userEvent.type(externalIdInput(), 'a');
      await userEvent.type(externalIdInput(), '{Backspace}');

      error.mockRestore();
      expect(acceptButton()).toBeDisabled();
    });
  });
});
