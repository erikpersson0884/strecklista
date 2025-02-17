import { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../Types';


interface UsersContextType {
    users: User[];
    addUser: (user: User) => void;
    removeUser: (id: string) => void;
    addUserBalance: (id: string, amount: number) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([
        {id:"2", name:"Oliver", nick:"Cal", balance:4847, imageUrl:"haosd" },
        {id:"231", name:"Erik", nick:"Göken", balance:193, imageUrl:"99832" },
        {id:"31", name:"Emma", nick:"Dino", balance:-591, imageUrl:"asdf983" }
    ]);
    

    const addUser = (user: User) => {
        setUsers((prevUsers) => [...prevUsers, user]);
    };

    const removeUser = (id: string) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    };

    const addUserBalance = (id: string, amount: number) => {
        setUsers((prevUsers) => prevUsers.map((user) => {
            if (user.id === id) {
                return { ...user, balance: user.balance + amount };
            }
            return user;
        }));
    };


    return (
        <UsersContext.Provider value={{ users, addUser, removeUser, addUserBalance }}>
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