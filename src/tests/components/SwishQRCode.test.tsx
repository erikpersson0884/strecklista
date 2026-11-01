import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import SwishQRCode from '@/components/swishQRCode/SwishQRCode';

const item = {
  name: 'Läsk',
  internalPrice: 12,
} as unknown as Item;

describe('SwishQRCode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the payment details and persists price editing', async () => {
    render(<SwishQRCode item={item} payeeNumber="0700000000" />);

    expect(screen.getByText('Betala med Swish')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Läsk' })).toBeInTheDocument();
    expect(screen.getByText('12:-')).toBeInTheDocument();
    expect(screen.getByLabelText('Tillåt att ändra pris')).not.toBeChecked();

    await userEvent.click(screen.getByLabelText('Tillåt att ändra pris'));
    expect(localStorage.getItem('swish-allow-price-change')).toBe('true');
  });
});
