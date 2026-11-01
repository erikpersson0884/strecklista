import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from '@/components/protectedRoute/ProtectedRoute';
import useAuthContext from '@/contexts/AuthContext';

vi.mock('@/contexts/AuthContext', () => ({ default: vi.fn() }));

const renderRoute = () => render(
  <MemoryRouter initialEntries={['/private']}>
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/private" element={<p>Private content</p>} />
      </Route>
      <Route path="/login" element={<p>Login page</p>} />
    </Routes>
  </MemoryRouter>,
);

describe('ProtectedRoute', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the loading page while authentication is in progress', () => {
    vi.mocked(useAuthContext).mockReturnValue(
      { isAuthenticated: false, isLoggingIn: true } as unknown as ReturnType<typeof useAuthContext>,
    );
    renderRoute();
    expect(screen.getByText('Loggar in...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', () => {
    vi.mocked(useAuthContext).mockReturnValue(
      { isAuthenticated: false, isLoggingIn: false } as unknown as ReturnType<typeof useAuthContext>,
    );
    renderRoute();
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected outlet for authenticated users', () => {
    vi.mocked(useAuthContext).mockReturnValue(
      { isAuthenticated: true, isLoggingIn: false } as unknown as ReturnType<typeof useAuthContext>,
    );
    renderRoute();
    expect(screen.getByText('Private content')).toBeInTheDocument();
  });
});
