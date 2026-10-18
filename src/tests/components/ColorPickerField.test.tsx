// src/tests/components/ColorPickerField.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import ColorPickerField from '@/components/colorPickerField/ColorPickerField'; // adjust path

// Stand-in picker: a text input that reports changes the way HexColorPicker does
vi.mock('react-colorful', () => ({
  HexColorPicker: ({ color, onChange }: { color: string; onChange: (c: string) => void }) => (
    <input data-testid="picker" value={color} onChange={(e) => onChange(e.target.value)} />
  ),
}));

const swatch = () => screen.getByRole('button');
const popover = () => document.querySelector('.color-picker-popover') as HTMLElement | null;

function setScroll(x: number, y: number) {
  Object.defineProperty(window, 'scrollX', { value: x, configurable: true });
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
}

beforeEach(() => {
  setScroll(0, 0);
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 100, left: 200, bottom: 120, right: 220, width: 20, height: 20, x: 200, y: 100,
    toJSON: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ColorPickerField', () => {
  describe('rendering', () => {
    it('shows the swatch in the given color', () => {
      render(<ColorPickerField color="#ff0000" onChange={vi.fn()} />);
      expect(swatch()).toHaveStyle({ backgroundColor: '#ff0000' });
    });

    it('applies the id to the wrapper', () => {
      const { container } = render(<ColorPickerField id="theme-color" color="#fff" onChange={vi.fn()} />);
      expect(container.firstChild).toHaveAttribute('id', 'theme-color');
    });

    it('starts closed', () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      expect(popover()).not.toBeInTheDocument();
      expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
    });

    it('updates the swatch when the color prop changes', () => {
      const { rerender } = render(<ColorPickerField color="#ff0000" onChange={vi.fn()} />);
      rerender(<ColorPickerField color="#00ff00" onChange={vi.fn()} />);
      expect(swatch()).toHaveStyle({ backgroundColor: '#00ff00' });
    });
  });

  describe('opening and closing', () => {
    it('opens the picker when the swatch is clicked', async () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      expect(screen.getByTestId('picker')).toBeInTheDocument();
    });

    it('renders the popover in document.body, not inside the field', async () => {
      const { container } = render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      expect(popover()?.parentElement).toBe(document.body);
      expect(container).not.toContainElement(popover());
    });

    it('closes when the swatch is clicked again', async () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      await userEvent.click(swatch());
      expect(popover()).not.toBeInTheDocument();
    });

    it('closes when the user presses the mouse outside', async () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      await userEvent.click(document.body);
      expect(popover()).not.toBeInTheDocument();
    });

    it('stays open when the user clicks inside the popover', async () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      await userEvent.click(screen.getByTestId('picker'));
      expect(popover()).toBeInTheDocument();
    });

    it('can be reopened after closing', async () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      await userEvent.click(document.body);
      await userEvent.click(swatch());
      expect(popover()).toBeInTheDocument();
    });

    it('removes its document listener on unmount', () => {
      const remove = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      unmount();
      expect(remove).toHaveBeenCalledWith('mousedown', expect.any(Function));
    });
  });

  describe('picking a color', () => {
    it('passes the picker color through and forwards changes', async () => {
      const onChange = vi.fn();
      render(<ColorPickerField color="#ff0000" onChange={onChange} />);
      await userEvent.click(swatch());

      const picker = screen.getByTestId('picker');
      expect(picker).toHaveValue('#ff0000');

      fireEvent.change(picker, { target: { value: '#00ff00' } });
      expect(onChange).toHaveBeenCalledWith('#00ff00');
    });

    it('does not close after a color is picked', async () => {
      render(<ColorPickerField color="#ff0000" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      fireEvent.change(screen.getByTestId('picker'), { target: { value: '#00ff00' } });
      expect(popover()).toBeInTheDocument();
    });
  });

  describe('positioning', () => {
    it('anchors the popover to the swatch, offset by the page scroll', async () => {
      setScroll(10, 50);
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());

      // top: 100 + 50, left: 200 + 10 - 8
      expect(popover()).toHaveStyle({
        position: 'absolute',
        top: '150px',
        left: '202px',
        transform: 'translate(-100%, -50%)',
      });
    });

    it('measures the swatch again each time it opens', async () => {
      render(<ColorPickerField color="#fff" onChange={vi.fn()} />);
      await userEvent.click(swatch());
      expect(popover()).toHaveStyle({ top: '100px' });

      await userEvent.click(swatch()); // close
      setScroll(0, 300);
      await userEvent.click(swatch()); // reopen
      expect(popover()).toHaveStyle({ top: '400px' });
    });
  });
});
