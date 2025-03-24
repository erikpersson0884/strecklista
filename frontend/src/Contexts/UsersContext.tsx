import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../Types';
import { getUsers, makeDeposit } from '../api/usersApi';


interface UsersContextType {
    users: User[];
    addUserBalance: (id: string, amount: number) => Promise<void>;
    getUserFromUserId: (userId: string) => User;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);
    
    const fetchUsers = async () => {
        try {
            const fetchedUsers = await getUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    const addUserBalance = async (id: number, amount: number) => {
        console.log('IN USERCONTEXT:', id, amount);
        const newBalance = await makeDeposit(id, amount)
        setUserBalance(id, newBalance);
    };

    const setUserBalance = (id: number, newBalance: number) => {
        setUsers((prevUsers) =>
            prevUsers.map((user) =>
                user.id === id ? { ...user, balance: newBalance } : user
            )
        );
    };

    const getUserFromUserId = (userId: number): User => {
        const user = users.find((user) => user.id === userId);
        if (!user) throw new Error(`User with id ${userId} not found`);
        return user;
    }


    return (
        <UsersContext.Provider value={{ users, addUserBalance, getUserFromUserId }}>
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