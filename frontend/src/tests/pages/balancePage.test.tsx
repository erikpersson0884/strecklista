import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useUsersContext } from '../../contexts/UsersContext';
import { useAuth } from '../../contexts/AuthContext';
import BalancePage from '../../pages/balancePage/BalancePage';
import RefillPopup from '../../pages/balancePage/RefillPopup';

jest.mock('../../contexts/UsersContext', () => ({
    useUsersContext: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../pages/balancePage/RefillPopup', () => () => <div data-testid="refill-popup" />);

describe('BalancePage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.VITE_AUTH_URL = "http://mock-auth-url.com";
    });

    test('renders "No users found" when there are no users', () => {
        (useUsersContext as jest.Mock).mockReturnValue({ users: [] });
        (useAuth as jest.Mock).mockReturnValue({ currentUser: null });

        render(<BalancePage />);

        expect(screen.getByText(/No users found/)).toBeInTheDocument();
    });

    test('renders users correctly', () => {
        const mockUsers = [
            { id: '1', nick: 'user1', name: 'User One', balance: 100 },
            { id: '2', nick: 'user2', name: 'User Two', balance: 50 },
        ];
        (useUsersContext as jest.Mock).mockReturnValue({ users: mockUsers });
        (useAuth as jest.Mock).mockReturnValue({ currentUser: mockUsers[0] });

        render(<BalancePage />);

        expect(screen.getByText('user1')).toBeInTheDocument();
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('100 kr')).toBeInTheDocument();

        expect(screen.getByText('user2')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
        expect(screen.getByText('50 kr')).toBeInTheDocument();
    });

    test('opens RefillPopup when add button is clicked', () => {
        const mockUsers = [{ id: '1', nick: 'user1', name: 'User One', balance: 100 }];
        (useUsersContext as jest.Mock).mockReturnValue({ users: mockUsers });
        (useAuth as jest.Mock).mockReturnValue({ currentUser: mockUsers[0] });

        render(<BalancePage />);

        const addButton = screen.getByRole('button');
        fireEvent.click(addButton);

        expect(screen.getByTestId('refill-popup')).toBeInTheDocument();
    });
});
