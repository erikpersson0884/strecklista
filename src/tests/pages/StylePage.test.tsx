// src/tests/pages/StylePage.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import StylePage from '@/pages/stylePage/StylePage'; // adjust path
import { useNotificationContext } from '@/contexts/NotificationContext';

vi.mock('@/contexts/NotificationContext', () => ({ useNotificationContext: vi.fn() }));

// Each mounted picker gets a new id, so a remount shows up as a changed data-mount-id
let mountCounter = 0;
vi.mock('@/components/colorPickerField/CssVarColorPicker', () => ({
  default: ({ cssVariable, label }: { cssVariable: string; label: string }) => {
    const [mountId] = useState(() => ++mountCounter);
    return (
      <div data-testid="picker" data-var={cssVariable} data-mount-id={mountId}>
        {label}
      </div>
    );
  },
}));

const VARIABLES = [
  '--background-color',
  '--card-color',
  '--accent-color',
  '--text-color',
  '--faint-text-color',
  '--link-color',
  '--button-color',
  '--button-hover-color',
  '--success-color',
  '--info-color',
  '--destructive-color',
  '--border-color',
];

const notify = vi.fn();

function setup() {
  vi.mocked(useNotificationContext).mockReturnValue({ notify } as any);
  render(<StylePage />);
}

const pickers = () => screen.getAllByTestId('picker');
const mountIds = () => pickers().map((p) => p.dataset.mountId);
const resetButton = () => screen.getByRole('button', { name: 'Clear styling' });
const root = () => document.documentElement;

beforeEach(() => {
  vi.clearAllMocks();
  mountCounter = 0;
  localStorage.clear();
  VARIABLES.forEach((v) => root().style.removeProperty(v));
});

describe('StylePage', () => {
  describe('rendering', () => {
    it('shows the heading', () => {
      setup();
      expect(screen.getByRole('heading', { name: 'Style Manager' })).toBeInTheDocument();
    });

    it('renders one picker per setting, in order', () => {
      setup();
      expect(pickers().map((p) => p.dataset.var)).toEqual(VARIABLES);
    });

    it('passes the label to each picker', () => {
      setup();
      expect(pickers()[0]).toHaveTextContent('Background Färg');
      expect(pickers()[2]).toHaveTextContent('Accent färg');
      expect(pickers()[10]).toHaveTextContent('Destruktiv Färg');
    });

    it('puts every picker in its own list item', () => {
      setup();
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(VARIABLES.length);
      items.forEach((li) => expect(within(li).getAllByTestId('picker')).toHaveLength(1));
    });

    it('shows the reset button with its tooltip', () => {
      setup();
      expect(resetButton()).toHaveClass('reset-button');
      expect(screen.getByTitle('Clear custom styles')).toBeInTheDocument();
    });

    it('does not reset or notify on its own', () => {
      setup();
      expect(notify).not.toHaveBeenCalled();
    });
  });

  describe('resetting', () => {
    it('removes every stored theme color', async () => {
      VARIABLES.forEach((v) => localStorage.setItem(`theme:${v}`, '#123456'));
      setup();
      await userEvent.click(resetButton());

      VARIABLES.forEach((v) => expect(localStorage.getItem(`theme:${v}`)).toBeNull());
    });

    it('leaves other stored values alone', async () => {
      localStorage.setItem('theme:--background-color', '#123456');
      localStorage.setItem('theme:--not-in-the-list', '#abcdef');
      localStorage.setItem('clientId', 'keep-me');
      setup();
      await userEvent.click(resetButton());

      expect(localStorage.getItem('theme:--not-in-the-list')).toBe('#abcdef');
      expect(localStorage.getItem('clientId')).toBe('keep-me');
    });

    it('removes the inline CSS variables from the root element', async () => {
      VARIABLES.forEach((v) => root().style.setProperty(v, '#123456'));
      setup();
      await userEvent.click(resetButton());

      VARIABLES.forEach((v) => expect(root().style.getPropertyValue(v)).toBe(''));
    });

    it('leaves unrelated inline styles alone', async () => {
      root().style.setProperty('--something-else', 'red');
      setup();
      await userEvent.click(resetButton());

      expect(root().style.getPropertyValue('--something-else')).toBe('red');
      root().style.removeProperty('--something-else');
    });

    it('remounts every picker so it re-reads its defaults', async () => {
      setup();
      const before = mountIds();
      await userEvent.click(resetButton());

      const after = mountIds();
      expect(after).toHaveLength(VARIABLES.length);
      after.forEach((id, i) => expect(id).not.toBe(before[i]));
    });

    it('keeps the same pickers in the same order after a reset', async () => {
      setup();
      await userEvent.click(resetButton());
      expect(pickers().map((p) => p.dataset.var)).toEqual(VARIABLES);
    });

    it('remounts again on every reset', async () => {
      setup();
      await userEvent.click(resetButton());
      const afterFirst = mountIds();
      await userEvent.click(resetButton());

      mountIds().forEach((id, i) => expect(id).not.toBe(afterFirst[i]));
    });

    it('tells the user the styles were cleared', async () => {
      setup();
      await userEvent.click(resetButton());

      expect(notify).toHaveBeenCalledTimes(1);
      expect(notify).toHaveBeenCalledWith('Custom styles cleared', 'info');
    });

    it('works when nothing was customized', async () => {
      setup();
      await userEvent.click(resetButton());
      expect(notify).toHaveBeenCalledTimes(1);
    });
  });
});
