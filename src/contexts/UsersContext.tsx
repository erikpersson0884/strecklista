import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import userApi from '../api/usersApi';
import transactionsApi from '../api/transactionsApi';


interface UsersContextType {
    isLoading: boolean;
    users: User[];
    addUserBalance: (userId: UserId, amount: number, comment?: string) => Promise<boolean>;
    getUserFromUserId: (userId: UserId) => User;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<User[]>([]);
    
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await userApi.getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsers();
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const addUserBalance = async (userId: UserId, amount: number, comment?: string): Promise<boolean> => {
        const newBalance = await transactionsApi.makeDeposit(userId, amount, comment)
        setUserBalance(userId, newBalance);
        return true;
    };

    const setUserBalance = (userId: UserId, newBalance: number) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === userId ? { ...user, balance: newBalance } : user
            )
        );
    };

    const getUserFromUserId = (userId: UserId): User => {
        const user = users.find((user) => user.id === userId);
        if (!user) console.log(users);
        if (!user) throw new Error(`User with id ${userId} not found`);
        return user;
    }


    return (
        <UsersContext.Provider value={{ 
            isLoading, 
            users, 
            addUserBalance, 
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