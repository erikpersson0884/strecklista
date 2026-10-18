// src/tests/components/ConfirmDialog.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ConfirmDialog from '@/components/confirmDialog/ConfirmDialog'; // adjust path
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

const closeModal = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
});

describe('ConfirmDialog', () => {
  it('renders the title and children', () => {
    render(
      <ConfirmDialog title="Ta bort vara?" onConfirm={vi.fn()}>
        <p>Det går inte att ångra.</p>
      </ConfirmDialog>
    );
    expect(screen.getByRole('heading', { name: 'Ta bort vara?' })).toBeInTheDocument();
    expect(screen.getByText('Det går inte att ångra.')).toBeInTheDocument();
  });

  it('uses "Godkänn" as the default confirm button text', () => {
    render(<ConfirmDialog title="t" onConfirm={vi.fn()}><p>x</p></ConfirmDialog>);
    expect(screen.getByRole('button', { name: 'Godkänn' })).toBeInTheDocument();
  });

  it('uses custom confirm button text', () => {
    render(
      <ConfirmDialog title="t" confirmButtonText="Ta bort" onConfirm={vi.fn()}>
        <p>x</p>
      </ConfirmDialog>
    );
    expect(screen.getByRole('button', { name: 'Ta bort' })).toBeInTheDocument();
  });

  it('adds the confirm-popup class', () => {
    const { container } = render(
      <ConfirmDialog title="t" onConfirm={vi.fn()}><p>x</p></ConfirmDialog>
    );
    expect(container.firstChild).toHaveClass('popup-window', 'confirm-popup');
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog title="t" onConfirm={onConfirm}><p>x</p></ConfirmDialog>);
    await userEvent.click(screen.getByRole('button', { name: 'Godkänn' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith();
  });

  it('does not call onConfirm until the button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog title="t" onConfirm={onConfirm}><p>x</p></ConfirmDialog>);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('closes the modal from the X button without confirming', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog title="t" onConfirm={onConfirm}><p>x</p></ConfirmDialog>);
    await userEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});