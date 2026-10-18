// src/tests/components/AddClientPopup.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AddClientPopup from '@/components/clientPopup/ClientPopup';
import { useClientContext } from '@/contexts/ClientContext';
import useNotificationContext from '@/contexts/NotificationContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/ClientContext', () => ({ useClientContext: vi.fn() }));
vi.mock('@/contexts/NotificationContext', () => ({ default: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

const notify = vi.fn();
const onAccept = vi.fn();
const availableScope = ['items.read', 'transactions.write'];

const client = {
  displayName: 'Scanner',
  description: 'Beep',
  scope: 'items.read transactions.write',
} as any; // adjust to your Client shape

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useClientContext).mockReturnValue({ availableScope } as any);
  vi.mocked(useNotificationContext).mockReturnValue({ notify } as any);
  vi.mocked(useModalContext).mockReturnValue({ closeModal: vi.fn() } as any);
});

const nameInput = () => screen.getByPlaceholderText('Namn');
const descriptionInput = () => screen.getByPlaceholderText('Beskrivning');
const checkbox = (value: string) =>
  screen.getAllByRole('checkbox').find((c) => (c as HTMLInputElement).value === value)!;
// Scope labels read "items.read" as "read items"
const scopeLabel = (text: string) => screen.getByText(text);
const acceptButton = (name = 'Skapa') => screen.getByRole('button', { name });

describe('AddClientPopup', () => {
  describe('rendering', () => {
    it('uses the default title and accept text', () => {
      render(<AddClientPopup onAccept={onAccept} />);
      expect(screen.getByRole('heading', { name: 'Klient' })).toBeInTheDocument();
      expect(acceptButton()).toBeInTheDocument();
    });

    it('uses a custom title and accept text', () => {
      render(<AddClientPopup onAccept={onAccept} title="Ny klient" acceptButtonText="Spara" />);
      expect(screen.getByRole('heading', { name: 'Ny klient' })).toBeInTheDocument();
      expect(acceptButton('Spara')).toBeInTheDocument();
    });

    it('adds the client-popup class and a custom className', () => {
      const { container } = render(<AddClientPopup onAccept={onAccept} className="custom" />);
      expect(container.firstChild).toHaveClass('client-popup', 'custom');
    });

    // Fails on the current code: no className produces the class "undefined".
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('does not add an "undefined" class when no className is given', () => {
      const { container } = render(<AddClientPopup onAccept={onAccept} />);
      expect(container.firstChild).not.toHaveClass('undefined');
    });

    it('shows one unchecked checkbox per available scope', () => {
      render(<AddClientPopup onAccept={onAccept} />);
      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
      expect(scopeLabel('read items')).toBeInTheDocument();
      expect(scopeLabel('write transactions')).toBeInTheDocument();
      screen.getAllByRole('checkbox').forEach((c) => expect(c).not.toBeChecked());
    });

    it('starts empty when no client is given', () => {
      render(<AddClientPopup onAccept={onAccept} />);
      expect(nameInput()).toHaveValue('');
      expect(descriptionInput()).toHaveValue('');
    });

    it('prefills the fields and scopes from a client', () => {
      render(<AddClientPopup onAccept={onAccept} client={client} />);
      expect(nameInput()).toHaveValue('Scanner');
      expect(descriptionInput()).toHaveValue('Beep');
      expect(checkbox('items.read')).toBeChecked();
      expect(checkbox('transactions.write')).toBeChecked();
    });
  });

  describe('accept button state', () => {
    it('is disabled when nothing is filled in', () => {
      render(<AddClientPopup onAccept={onAccept} />);
      expect(acceptButton()).toBeDisabled();
    });

    it('is disabled with a name but no scope', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.type(nameInput(), 'Scanner');
      expect(acceptButton()).toBeDisabled();
    });

    it('is disabled with a scope but no name', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.click(scopeLabel('read items'));
      expect(acceptButton()).toBeDisabled();
    });

    it('is disabled when the name is only whitespace', async () => {
      render(<AddClientPopup onAccept={onAccept} client={client} />);
      await userEvent.clear(nameInput());
      await userEvent.type(nameInput(), '   ');
      expect(acceptButton()).toBeDisabled();
    });

    it('is enabled with a name and at least one scope', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.type(nameInput(), 'Scanner');
      await userEvent.click(scopeLabel('read items'));
      expect(acceptButton()).toBeEnabled();
    });

    it('becomes disabled again when the last scope is unchecked', async () => {
      render(<AddClientPopup onAccept={onAccept} client={{ ...client, scope: 'items.read' }} />);
      expect(acceptButton()).toBeEnabled();
      await userEvent.click(scopeLabel('read items'));
      expect(acceptButton()).toBeDisabled();
    });
  });

  describe('scopes', () => {
    it('checks and unchecks a scope when its label is clicked', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.click(scopeLabel('read items'));
      expect(checkbox('items.read')).toBeChecked();
      expect(checkbox('transactions.write')).not.toBeChecked();

      await userEvent.click(scopeLabel('read items'));
      expect(checkbox('items.read')).not.toBeChecked();
    });

    // Fails on the current code (see "double toggle" below).
    it.fails('checks a scope when the checkbox itself is clicked', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.click(checkbox('items.read'));
      expect(checkbox('items.read')).toBeChecked();
    });
  });

  describe('submitting', () => {
    it('calls onAccept with name, description and space-separated scopes', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.type(nameInput(), 'Scanner');
      await userEvent.type(descriptionInput(), 'Beep');
      await userEvent.click(scopeLabel('read items'));
      await userEvent.click(scopeLabel('write transactions'));
      await userEvent.click(acceptButton());

      expect(onAccept).toHaveBeenCalledTimes(1);
      expect(onAccept).toHaveBeenCalledWith('Scanner', 'Beep', 'items.read transactions.write');
    });

    it('orders scopes by when they were checked, not by the list order', async () => {
      render(<AddClientPopup onAccept={onAccept} />);
      await userEvent.type(nameInput(), 'Scanner');
      await userEvent.click(scopeLabel('write transactions'));
      await userEvent.click(scopeLabel('read items'));
      await userEvent.click(acceptButton());

      expect(onAccept).toHaveBeenCalledWith('Scanner', '', 'transactions.write items.read');
    });

    it('submits the original values when editing and nothing is changed', async () => {
      render(<AddClientPopup onAccept={onAccept} client={client} />);
      await userEvent.click(acceptButton());
      expect(onAccept).toHaveBeenCalledWith('Scanner', 'Beep', 'items.read transactions.write');
    });

    it('submits edited values', async () => {
      render(<AddClientPopup onAccept={onAccept} client={client} />);
      await userEvent.clear(nameInput());
      await userEvent.type(nameInput(), 'Ny scanner');
      await userEvent.click(scopeLabel('write transactions')); // uncheck
      await userEvent.click(acceptButton());

      expect(onAccept).toHaveBeenCalledWith('Ny scanner', 'Beep', 'items.read');
    });

    it('notifies when onAccept throws', async () => {
      onAccept.mockImplementation(() => { throw new Error('boom'); });
      render(<AddClientPopup onAccept={onAccept} client={client} />);
      await userEvent.click(acceptButton());

      expect(notify).toHaveBeenCalledWith('Ett fel uppstod vid skapandet av klienten.');
    });

    it('notifies when onAccept succeeds', async () => {
      render(<AddClientPopup onAccept={onAccept} client={client} />);
      await userEvent.click(acceptButton());
      expect(notify).toHaveBeenCalled();
    });
  });
});
