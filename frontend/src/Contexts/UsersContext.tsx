import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../Types';


interface UsersContextType {
    users: User[];
    addUser: (user: User) => void;
    removeUser: (id: number) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);

    const addUser = (user: User) => {
        setUsers((prevUsers) => [...prevUsers, user]);
    };

    const removeUser = (id: number) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    };

    return (
        <UsersContext.Provider value={{ users, addUser, removeUser }}>
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