import React, { createContext, useContext, useState } from 'react';
import Modal from '../components/modal/Modal';

type ModalContextType = {
    openModal: (content: React.ReactNode) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

    const openModal = (content: React.ReactNode) => setModalContent(content);
    const closeModal = () => setModalContent(null);

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
        {children}
        {modalContent && (
            <Modal onClose={closeModal}>
                {modalContent}
            </Modal>
        )}
        </ModalContext.Provider>
    );
};

export const useModalContext = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within a ModalProvider');
    return context;
};
