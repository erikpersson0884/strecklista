// src/tests/pages/LoadingPage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingPage from '@/pages/loadingPage/LoadingPage';

describe('LoadingPage', () => {
    it('shows the default message', () => {
        render(<LoadingPage />);

        expect(screen.getByText('Laddar...')).toBeInTheDocument();
    });

    it('shows a custom message instead of the default one', () => {
        render(<LoadingPage message="Hämtar transaktioner..." />);

        expect(screen.getByText('Hämtar transaktioner...')).toBeInTheDocument();
        expect(screen.queryByText('Laddar...')).not.toBeInTheDocument();
    });

    it('shows the loading animation', () => {
        render(<LoadingPage />);

        const image = screen.getByRole('img', { name: 'Loading' });
        expect(image).toHaveAttribute('height', '40');
        expect(image).toHaveAttribute('src');
    });

    it('is wrapped in a page container', () => {
        const { container } = render(<LoadingPage />);

        expect(container.firstChild).toHaveClass('page');
    });
});
