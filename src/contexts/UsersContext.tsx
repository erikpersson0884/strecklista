import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

import userApi from '@/api/userApi';
import transactionsApi from '@/api/transactionApi';

import useAuthContext from './AuthContext';
import useNotificationContext from './NotificationContext';


interface UsersContextType {
    isLoadingUsers: boolean;
    users: User[];
    addUserBalance: (userId: UserId, amount: number, comment?: string) => Promise<boolean>;
    setUserBalance: (userId: UserId, newBalance: number) => void;
    getUserFromUserId: (userId: UserId) => User;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuthContext();
    const { notify } = useNotificationContext();

    const [ isLoadingUsers, setIsLoadingUsers ] = useState<boolean>(true);
    const [ users, setUsers ] = useState<User[]>([]);
    
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await userApi.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchData = async () => {
            setIsLoadingUsers(true);
            await fetchUsers();
            setIsLoadingUsers(false);
        };

        fetchData();
    }, [isAuthenticated]);

    const addUserBalance = async (userId: UserId, amount: number, comment?: string): Promise<boolean> => {
        try {
            const newBalance = await transactionsApi.makeDeposit(userId, amount, comment)
            setUserBalance(userId, newBalance);
            notify('Saldo uppdaterat!');
            return true;
        } catch (error) {
            notify('Något gick fel, försök igen senare.');
            return false;
        }
    };

    const setUserBalance = (userId: UserId, newBalance: number) => {
        checkThatUserExists(userId);
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, balance: newBalance } : user
            )
        );
    };

    const getUserFromUserId = (userId: UserId): User => {
        const user = users.find((user) => user.id === userId);
        if (!user) throw new Error(`User with id ${userId} not found`);
        return user;
    }

    const checkThatUserExists = (userId: UserId): void => {
        if (!userExists(userId)) throw new Error(`User with id ${userId} not found`);
    }

    const userExists = (userId: UserId): boolean => {
        return users.some((user) => user.id === userId);
    };


    return (
        <UsersContext.Provider value={{ 
            isLoadingUsers, 
            users, 
            addUserBalance,
            setUserBalance,
            getUserFromUserId 
        }}>
            {children}
        </UsersContext.Provider>
    );
};

export const useUsersContext = (): UsersContextType => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers must be used within a UsersProvider');
    }
    return context;
};

export default useUsersContext;
