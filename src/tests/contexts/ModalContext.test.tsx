import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModalProvider, useModalContext } from '@/contexts/ModalContext';

const setup = () => renderHook(() => useModalContext(), { wrapper: ModalProvider });

const overlay = () => screen.getByText('Hello').closest('aside') as HTMLElement;

describe('ModalContext', () => {
    describe('state', () => {
        it('starts closed with nothing rendered', () => {
            const { result } = setup();

            expect(result.current.modalIsOpen).toBe(false);
            expect(result.current.modalContent).toBeNull();
            expect(document.querySelector('.modal-overlay')).toBeNull();
        });

        it('openModal shows the content inside the overlay', () => {
            const { result } = setup();

            act(() => result.current.openModal(<span>Hello</span>));

            expect(result.current.modalIsOpen).toBe(true);
            expect(screen.getByText('Hello')).toBeInTheDocument();
            expect(overlay()).toHaveClass('modal-overlay');
        });

        it('closeModal removes the content', () => {
            const { result } = setup();
            act(() => result.current.openModal(<span>Hello</span>));

            act(() => result.current.closeModal());

            expect(result.current.modalIsOpen).toBe(false);
            expect(result.current.modalContent).toBeNull();
            expect(screen.queryByText('Hello')).not.toBeInTheDocument();
        });

        it('closeModal does nothing when no modal is open', () => {
            const { result } = setup();

            expect(() => act(() => result.current.closeModal())).not.toThrow();
            expect(result.current.modalIsOpen).toBe(false);
        });

        it('opening a second modal replaces the first', () => {
            const { result } = setup();
            act(() => result.current.openModal(<span>Hello</span>));

            act(() => result.current.openModal(<span>Second</span>));

            expect(screen.queryByText('Hello')).not.toBeInTheDocument();
            expect(screen.getByText('Second')).toBeInTheDocument();
            expect(document.querySelectorAll('.modal-overlay')).toHaveLength(1);
        });
    });

    describe('overlay clicks', () => {
        it('clicking the overlay closes the modal', () => {
            const { result } = setup();
            act(() => result.current.openModal(<span>Hello</span>));

            fireEvent.click(overlay());

            expect(result.current.modalIsOpen).toBe(false);
            expect(screen.queryByText('Hello')).not.toBeInTheDocument();
        });

        it('a click inside content that stops propagation keeps the modal open', () => {
            const { result } = setup();
            act(() =>
                result.current.openModal(
                    <div onClick={(e) => e.stopPropagation()}>
                        <span>Hello</span>
                    </div>
                )
            );

            fireEvent.click(screen.getByText('Hello'));

            expect(result.current.modalIsOpen).toBe(true);
            expect(screen.getByText('Hello')).toBeInTheDocument();
        });

        // Characterization: the overlay closes on ANY click that reaches it, so every
        // popup has to call stopPropagation itself (PopupWindow, Cart and SwishQRCode do).
        it('a click inside content that does not stop propagation closes the modal', () => {
            const { result } = setup();
            act(() => result.current.openModal(<span>Hello</span>));

            fireEvent.click(screen.getByText('Hello'));

            expect(result.current.modalIsOpen).toBe(false);
        });

        it('lets content close the modal itself through the context', () => {
            const Content = () => {
                const { closeModal } = useModalContext();
                return <button onClick={(e) => { e.stopPropagation(); closeModal(); }}>Done</button>;
            };
            const { result } = setup();
            act(() => result.current.openModal(<Content />));

            fireEvent.click(screen.getByText('Done'));

            expect(result.current.modalIsOpen).toBe(false);
        });
    });

    it('useModalContext throws outside the provider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => renderHook(() => useModalContext())).toThrow('ModalProvider');
    });
});