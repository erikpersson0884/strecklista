// src/tests/components/PopupWindow.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import PopupWindow from '@/components/popupWindow/PopupWindow'; // adjust path
import useModalContext from '@/contexts/ModalContext';

vi.mock('@/contexts/ModalContext', () => ({ default: vi.fn() }));

const closeModal = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useModalContext).mockReturnValue({ closeModal } as any);
});

describe('PopupWindow', () => {
  it('renders its children', () => {
    render(<PopupWindow><p>Hello</p></PopupWindow>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders the title as a heading when given', () => {
    render(<PopupWindow title="Insättning"><p>Content</p></PopupWindow>);
    expect(screen.getByRole('heading', { level: 2, name: 'Insättning' })).toBeInTheDocument();
  });

  it('renders no heading when no title is given', () => {
    render(<PopupWindow><p>Content</p></PopupWindow>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('applies a custom className alongside the base class', () => {
    const { container } = render(
      <PopupWindow className="custom"><p>Content</p></PopupWindow>
    );
    expect(container.firstChild).toHaveClass('popup-window', 'custom');
  });

  it('closes the modal when the close button is clicked', async () => {
    render(<PopupWindow><p>Content</p></PopupWindow>);
    await userEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(closeModal).toHaveBeenCalledTimes(1);
  });

  it('calls onClose before closing the modal', async () => {
    const calls: string[] = [];
    const onClose = vi.fn(() => calls.push('onClose'));
    closeModal.mockImplementation(() => calls.push('closeModal'));

    render(<PopupWindow onClose={onClose}><p>Content</p></PopupWindow>);
    await userEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(calls).toEqual(['onClose', 'closeModal']);
  });
});