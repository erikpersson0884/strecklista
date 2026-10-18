// src/tests/pages/AboutPage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AboutPage from '@/pages/aboutPage/AboutPage';

describe('AboutPage', () => {
    it('shows the heading', () => {
        render(<AboutPage />);

        expect(screen.getByRole('heading', { level: 1, name: 'Om' })).toBeInTheDocument();
    });

    it('shows the about text', () => {
        render(<AboutPage />);

        expect(screen.getByText(/Strecklistan har tagit/)).toBeInTheDocument();
    });

    it('is wrapped in a page container', () => {
        const { container } = render(<AboutPage />);

        expect(container.firstChild).toHaveClass('page');
    });
});
