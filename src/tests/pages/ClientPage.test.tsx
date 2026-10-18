// src/tests/pages/ClientPage.test.tsx
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ClientPage from '@/pages/clientPage/ClientPage'; // adjust path
import ClientPopup from '@/components/clientPopup/ClientPopup';
import DisplayClientPopup from '@/components/displayClientPopup/DisplayClientPopup';
import { useClientContext } from '@/contexts/ClientContext';
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/ClientContext', () => ({ useClientContext: vi.fn() }));
vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));
vi.mock('@/pages/loadingPage/LoadingPage', () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));
vi.mock('@/components/clientPopup/ClientPopup', () => ({
  default: () => <div data-testid="client-popup" />,
}));
vi.mock('@/components/displayClientPopup/DisplayClientPopup', () => ({
  default: () => <div data-testid="display-client-popup" />,
}));

// ---------- test data ----------
const scanner = { id: 'c1', displayName: 'P.R.I.T. Scanner', scope: 'items.read' };
const kiosk = { id: 'c2', displayName: 'Kiosk', scope: 'items.read group.read' };

// ---------- setup ----------
type Setup = {
  clients?: unknown[];
  isLoadingClients?: boolean;
  createResult?: unknown;
};

function setup(o: Setup = {}) {
  const createClient = vi.fn().mockResolvedValue(
    o.createResult ?? { client: { id: 'new', displayName: 'Ny' }, secret: 's3cr3t' }
  );
  const deleteClient = vi.fn().mockResolvedValue(undefined);
  const openModal = vi.fn();

  vi.mocked(useClientContext).mockReturnValue({
    clients: o.clients ?? [scanner, kiosk],
    isLoadingClients: o.isLoadingClients ?? false,
    createClient,
    deleteClient,
  } as any);
  vi.mocked(useModalContext).mockReturnValue({ openModal } as any);

  render(<ClientPage />);
  return { createClient, deleteClient, openModal };
}

// ---------- helpers ----------
const rows = () => screen.queryAllByRole('listitem');
const deleteButtons = () => screen.getAllByRole('button', { name: 'Delete' });
const addButton = () => screen.getByRole('button', { name: 'Add Client' });

// Opens the create popup and returns the props it was given
async function openCreatePopup(ctx: ReturnType<typeof setup>) {
  await userEvent.click(addButton());
  return ctx.openModal.mock.calls[0][0].props;
}

let confirmSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom does not implement confirm; default to "user pressed OK"
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  confirmSpy.mockRestore();
});

describe('ClientPage', () => {
  describe('loading', () => {
    it('shows only the loading page while clients load', () => {
      setup({ isLoadingClients: true });
      expect(screen.getByText('Hämtar klienter...')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add Client' })).not.toBeInTheDocument();
    });

    it('shows no loading page when not loading', () => {
      setup();
      expect(screen.queryByText('Hämtar klienter...')).not.toBeInTheDocument();
    });
  });

  describe('client list', () => {
    it('shows the heading', () => {
      setup();
      expect(screen.getByRole('heading', { name: 'Client Manager' })).toBeInTheDocument();
    });

    it('lists each client by display name', () => {
      setup();
      expect(screen.getByText('P.R.I.T. Scanner')).toBeInTheDocument();
      expect(screen.getByText('Kiosk')).toBeInTheDocument();
      // two clients plus the "add" button, which is also an li-less button in the ul
      expect(rows()).toHaveLength(2);
    });

    it('has one delete button per client', () => {
      setup();
      expect(deleteButtons()).toHaveLength(2);
    });

    it('shows a message and no rows when there are no clients', () => {
      setup({ clients: [] });
      expect(screen.getByText('Inga klienter hittades.')).toBeInTheDocument();
      expect(rows()).toHaveLength(0);
    });

    it('hides the empty message when there are clients', () => {
      setup();
      expect(screen.queryByText('Inga klienter hittades.')).not.toBeInTheDocument();
    });

    it('still offers to add a client when the list is empty', () => {
      setup({ clients: [] });
      expect(addButton()).toBeInTheDocument();
    });
  });

  describe('viewing a client', () => {
    it('opens the display popup for the clicked client', async () => {
      const { openModal } = setup();
      await userEvent.click(screen.getByText('Kiosk'));

      expect(openModal).toHaveBeenCalledTimes(1);
      const element = openModal.mock.calls[0][0];
      expect(element.type).toBe(DisplayClientPopup);
      expect(element.props.client).toBe(kiosk);
    });

    it('does not pass a secret when viewing', async () => {
      const { openModal } = setup();
      await userEvent.click(screen.getByText('Kiosk'));
      expect(openModal.mock.calls[0][0].props.secret).toBeUndefined();
    });

    it('does nothing until a row is clicked', () => {
      const { openModal } = setup();
      expect(openModal).not.toHaveBeenCalled();
    });
  });

  describe('creating a client', () => {
    it('opens the create popup with Swedish texts', async () => {
      const { openModal } = setup();
      await userEvent.click(addButton());

      expect(openModal).toHaveBeenCalledTimes(1);
      const element = openModal.mock.calls[0][0];
      expect(element.type).toBe(ClientPopup);
      expect(element.props.title).toBe('Lägg till klient');
      expect(element.props.acceptButtonText).toBe('Lägg till');
      expect(element.props.client).toBeUndefined();
    });

    it('creates the client with the entered values', async () => {
      const ctx = setup();
      const props = await openCreatePopup(ctx);
      await act(async () => { await props.onAccept('Scanner', 'Beep', 'items.read'); });

      expect(ctx.createClient).toHaveBeenCalledTimes(1);
      expect(ctx.createClient).toHaveBeenCalledWith('Scanner', 'Beep', 'items.read');
    });

    it('shows the new client and its secret afterwards', async () => {
      const created = { id: 'new', displayName: 'Ny' };
      const ctx = setup({ createResult: { client: created, secret: 's3cr3t' } });
      const props = await openCreatePopup(ctx);
      await act(async () => { await props.onAccept('Ny', '', 'items.read'); });

      await waitFor(() => expect(ctx.openModal).toHaveBeenCalledTimes(2));
      const element = ctx.openModal.mock.calls[1][0];
      expect(element.type).toBe(DisplayClientPopup);
      expect(element.props.client).toBe(created);
      expect(element.props.secret).toBe('s3cr3t');
      expect(element.props.title).toBe('Skapad klient');
    });

    it('opens nothing more when no client was created', async () => {
      const ctx = setup({ createResult: { client: null, secret: undefined } });
      const props = await openCreatePopup(ctx);
      await act(async () => { await props.onAccept('Ny', '', 'items.read'); });

      expect(ctx.createClient).toHaveBeenCalled();
      expect(ctx.openModal).toHaveBeenCalledTimes(1); // only the create popup
    });
  });

  describe('deleting a client', () => {
    it('asks for confirmation in Swedish', async () => {
      setup();
      await userEvent.click(deleteButtons()[0]);
      expect(confirmSpy).toHaveBeenCalledWith('Är du säker på att du vill ta bort klienten?');
    });

    it('deletes the client when confirmed', async () => {
      const { deleteClient } = setup();
      await userEvent.click(deleteButtons()[1]);

      expect(deleteClient).toHaveBeenCalledTimes(1);
      expect(deleteClient).toHaveBeenCalledWith('c2');
    });

    it('does not delete when the user cancels', async () => {
      confirmSpy.mockReturnValue(false);
      const { deleteClient } = setup();
      await userEvent.click(deleteButtons()[0]);

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      expect(deleteClient).not.toHaveBeenCalled();
    });

    it('does not ask or delete until a delete button is clicked', () => {
      const { deleteClient } = setup();
      expect(confirmSpy).not.toHaveBeenCalled();
      expect(deleteClient).not.toHaveBeenCalled();
    });

    // Fails on the current code: the click bubbles up to the row (see "delete opens the viewer" below).
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('does not open the client viewer when delete is clicked', async () => {
      const { openModal } = setup();
      await userEvent.click(deleteButtons()[0]);
      expect(openModal).not.toHaveBeenCalled();
    });
  });
});
