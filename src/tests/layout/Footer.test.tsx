// src/tests/components/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Footer from '@/layouts/footer/Footer'; // adjust path

describe('Footer', () => {
  it('renders as a footer landmark with the page-footer class', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('page-footer');
  });

  it('credits both authors and the year', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'Skapad av Göken och Cal 2025'
    );
  });

  it('links each author to their GitHub profile', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: 'Göken' })).toHaveAttribute(
      'href',
      'https://github.com/erikpersson0884/'
    );
    expect(screen.getByRole('link', { name: 'Cal' })).toHaveAttribute(
      'href',
      'https://github.com/olillin/'
    );
  });
});
