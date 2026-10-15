// src/tests/components/CssVarColorPicker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import CssVarColorPicker from '@/components/colorPickerField/CssVarColorPicker'; // adjust path
import {
  readStoredColor,
  writeStoredColor,
  applyCssVar,
  getTrueDefault,
} from '@/themeStorage';

vi.mock('@/themeStorage', () => ({
  readStoredColor: vi.fn(),
  writeStoredColor: vi.fn(),
  applyCssVar: vi.fn(),
  getTrueDefault: vi.fn(),
}));

// Must resolve to the same file as "./ColorPickerField" in the component (adjust path).
// The real field puts `id` on a wrapper div, so expose it as data-id to check what is passed.
vi.mock('@/components/colorPickerField/ColorPickerField', () => ({
  default: ({
    id,
    color,
    onChange,
  }: {
    id?: string;
    color: string;
    onChange: (c: string) => void;
  }) => (
    <input
      data-testid="field"
      data-id={id}
      value={color}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const defaults: Record<string, string> = {
  '--primary': '#111111',
  '--secondary': '#222222',
};

const field = () => screen.getByTestId('field');
const pick = (color: string) => fireEvent.change(field(), { target: { value: color } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTrueDefault).mockImplementation((v: string) => defaults[v]);
  vi.mocked(readStoredColor).mockReturnValue(null);
});

describe('CssVarColorPicker', () => {
  describe('rendering', () => {
    it('uses "Color" as the default label', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(screen.getByText('Color :')).toBeInTheDocument();
    });

    it('uses a custom label', () => {
      render(<CssVarColorPicker cssVariable="--primary" label="Bakgrund" />);
      expect(screen.getByText('Bakgrund :')).toBeInTheDocument();
    });

    it('points the label and the field at the same id', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      const id = 'css-var-color---primary';
      expect(screen.getByText('Color :')).toHaveAttribute('for', id);
      expect(field()).toHaveAttribute('data-id', id);
    });
  });

  describe('initial color', () => {
    it('uses the default when nothing is stored', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(field()).toHaveValue('#111111');
      expect(readStoredColor).toHaveBeenCalledWith('--primary');
    });

    it('uses the stored color when there is one', () => {
      vi.mocked(readStoredColor).mockReturnValue('#abcdef');
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(field()).toHaveValue('#abcdef');
    });

    it('applies the initial color to the CSS variable once on mount', () => {
      vi.mocked(readStoredColor).mockReturnValue('#abcdef');
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(applyCssVar).toHaveBeenCalledTimes(1);
      expect(applyCssVar).toHaveBeenCalledWith('--primary', '#abcdef');
    });

    it('does not write to storage on mount', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(writeStoredColor).not.toHaveBeenCalled();
    });
  });

  describe('customized marker', () => {
    it('has no asterisk when the color is the default', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(screen.queryByText(/\*/)).not.toBeInTheDocument();
    });

    it('shows an asterisk when the stored color differs from the default', () => {
      vi.mocked(readStoredColor).mockReturnValue('#abcdef');
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(screen.getByText('Color* :')).toBeInTheDocument();
    });

    it('ignores case and surrounding whitespace when comparing to the default', () => {
      vi.mocked(readStoredColor).mockReturnValue('  #111111  '.toUpperCase());
      render(<CssVarColorPicker cssVariable="--primary" />);
      expect(screen.queryByText(/\*/)).not.toBeInTheDocument();
    });
  });

  describe('changing the color', () => {
    it('applies and stores the new color', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      vi.mocked(applyCssVar).mockClear();

      pick('#00ff00');

      expect(field()).toHaveValue('#00ff00');
      expect(applyCssVar).toHaveBeenCalledTimes(1);
      expect(applyCssVar).toHaveBeenCalledWith('--primary', '#00ff00');
      expect(writeStoredColor).toHaveBeenCalledTimes(1);
      expect(writeStoredColor).toHaveBeenCalledWith('--primary', '#00ff00');
    });

    it('shows the asterisk after picking a non-default color', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      pick('#00ff00');
      expect(screen.getByText('Color* :')).toBeInTheDocument();
    });

    it('removes the asterisk when the default is picked again, and still stores it', () => {
      vi.mocked(readStoredColor).mockReturnValue('#abcdef');
      render(<CssVarColorPicker cssVariable="--primary" />);

      pick('#111111');

      expect(screen.queryByText(/\*/)).not.toBeInTheDocument();
      expect(writeStoredColor).toHaveBeenCalledWith('--primary', '#111111');
    });

    it('stores each change as it happens', () => {
      render(<CssVarColorPicker cssVariable="--primary" />);
      pick('#aa0000');
      pick('#bb0000');
      expect(writeStoredColor).toHaveBeenNthCalledWith(1, '--primary', '#aa0000');
      expect(writeStoredColor).toHaveBeenNthCalledWith(2, '--primary', '#bb0000');
    });
  });

  describe('switching variable', () => {
    it('loads and applies the color of the new variable', () => {
      const { rerender } = render(<CssVarColorPicker cssVariable="--primary" />);

      rerender(<CssVarColorPicker cssVariable="--secondary" />);

      expect(readStoredColor).toHaveBeenLastCalledWith('--secondary');
      expect(field()).toHaveValue('#222222');
      expect(field()).toHaveAttribute('data-id', 'css-var-color---secondary');
      expect(applyCssVar).toHaveBeenLastCalledWith('--secondary', '#222222');
    });

    it('prefers the stored color of the new variable', () => {
      const { rerender } = render(<CssVarColorPicker cssVariable="--primary" />);
      vi.mocked(readStoredColor).mockImplementation((v: string) =>
        v === '--secondary' ? '#abcdef' : null
      );

      rerender(<CssVarColorPicker cssVariable="--secondary" />);

      expect(field()).toHaveValue('#abcdef');
    });

    it('writes to the new variable after a change, not the old one', () => {
      const { rerender } = render(<CssVarColorPicker cssVariable="--primary" />);
      rerender(<CssVarColorPicker cssVariable="--secondary" />);
      vi.mocked(writeStoredColor).mockClear();

      pick('#00ff00');

      expect(writeStoredColor).toHaveBeenCalledTimes(1);
      expect(writeStoredColor).toHaveBeenCalledWith('--secondary', '#00ff00');
    });

    // Fails on the current code (see "switching stores the default" below).
    // `it.fails` passes while the bug exists; switch it to `it` once fixed.
    it.fails('does not write anything to storage just from switching variable', () => {
      const { rerender } = render(<CssVarColorPicker cssVariable="--primary" />);
      rerender(<CssVarColorPicker cssVariable="--secondary" />);
      expect(writeStoredColor).not.toHaveBeenCalled();
    });
  });
});