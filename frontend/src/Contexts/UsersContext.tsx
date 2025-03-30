import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getUsers, makeDeposit } from '../api/usersApi';


interface UsersContextType {
    users: User[];
    addUserBalance: (userId: UserId, amount: number) => Promise<void>;
    getUserFromUserId: (userId: UserId) => User;
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


    const addUserBalance = async (userId: UserId, amount: number) => {
        console.log('IN USERCONTEXT:', userId, amount);
        const newBalance = await makeDeposit(userId, amount)
        setUserBalance(userId, newBalance);
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
        console.log("ANTAL ANVÄNDARE", users.length)

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