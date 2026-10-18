import type { ReactElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InventoryPage from '@/pages/inventoryPage/InventoryPage';

const { mockDeleteItem, mockRefillItem, mockOpenModal, mockCloseModal, inventoryState } = vi.hoisted(() => {
    const mockDeleteItem = vi.fn();
    const mockRefillItem = vi.fn();
    return {
        mockDeleteItem,
        mockRefillItem,
        mockOpenModal: vi.fn(),
        mockCloseModal: vi.fn(),
        // One stable object, mutated per test
        inventoryState: {
            items: [] as unknown[],
            isLoadingInventory: false,
            deleteItem: mockDeleteItem,
            refillItem: mockRefillItem,
        },
    };
});

vi.mock('@/contexts/InventoryContext', () => ({
    default: () => inventoryState,
    useInventoryContext: () => inventoryState,
}));

vi.mock('@/contexts/ModalContext', () => ({
    default: () => ({ openModal: mockOpenModal, closeModal: mockCloseModal }),
    useModalContext: () => ({ openModal: mockOpenModal, closeModal: mockCloseModal }),
}));

vi.mock('@/components/addProductPopup/AddProductPopup', () => ({
    default: () => <div>AddProductPopup</div>,
}));

vi.mock('@/components/updateItemPopup/UpdateItemPopup', () => ({
    default: ({ item }: { item: Item }) => <div>UpdateItemPopup {item.name}</div>,
}));

vi.mock('@/components/refillPopup/RefillPopup', () => ({
    default: (props: {
        item: Item;
        refillAction: (id: string, amount: number) => void;
        currentBalance: number;
        suffix: string;
    }) => (
        <div data-testid="refill-popup" data-balance={props.currentBalance} data-suffix={props.suffix}>
            RefillPopup {props.item.name}
            <button onClick={() => props.refillAction(props.item.id, 5)}>do refill</button>
        </div>
    ),
}));

vi.mock('@/components/confirmDialog/ConfirmDialog', () => ({
    default: (props: {
        title: string;
        confirmButtonText: string;
        onConfirm: () => void;
        children: React.ReactNode;
    }) => (
        <div>
            <h2>{props.title}</h2>
            {props.children}
            <button onClick={props.onConfirm}>{props.confirmButtonText}</button>
        </div>
    ),
}));

vi.mock('@/components/icon/ProductIcon', () => ({
    default: ({ item }: { item: Item }) => <span data-testid="product-icon">{item.id}</span>,
}));

const makeItem = (id: string, name: string, amountInStock = 5) =>
    ({ id, name, amountInStock, icon: '', internalPrice: 10, available: true }) as unknown as Item;

const lastOpenedModal = (): ReactElement => mockOpenModal.mock.calls.at(-1)![0];

describe('InventoryPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        inventoryState.isLoadingInventory = false;
        inventoryState.items = [makeItem('1', 'Kaffe', 5), makeItem('2', 'Te', 12)];
    });

    describe('states', () => {
        it('shows the loading page while the inventory loads', () => {
            inventoryState.isLoadingInventory = true;

            render(<InventoryPage />);

            expect(screen.getByText('Hämtar produkter...')).toBeInTheDocument();
            expect(screen.queryByText('Kaffe')).not.toBeInTheDocument();
        });

        it('shows a message but keeps the add button when there are no items', () => {
            inventoryState.items = [];

            render(<InventoryPage />);

            expect(screen.getByText('Inga produkter i lager')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Lägg till vara' })).toBeInTheDocument();
        });

        it('lists every item with edit, refill and delete buttons', () => {
            render(<InventoryPage />);

            expect(screen.getByText('Kaffe')).toBeInTheDocument();
            expect(screen.getByText('Te')).toBeInTheDocument();
            expect(screen.getAllByTestId('product-icon')).toHaveLength(2);
            expect(screen.getAllByRole('button', { name: 'Redigera' })).toHaveLength(2);
            expect(screen.getAllByRole('button', { name: 'Påfyllnad' })).toHaveLength(2);
            expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2);
        });
    });

    describe('popups', () => {
        it('the add button opens the add-product popup', () => {
            render(<InventoryPage />);

            fireEvent.click(screen.getByRole('button', { name: 'Lägg till vara' }));
            render(lastOpenedModal());

            expect(screen.getByText('AddProductPopup')).toBeInTheDocument();
        });

        it('the edit button opens the update popup for that item', () => {
            render(<InventoryPage />);

            fireEvent.click(screen.getAllByRole('button', { name: 'Redigera' })[1]);
            render(lastOpenedModal());

            expect(screen.getByText('UpdateItemPopup Te')).toBeInTheDocument();
        });

        it('the refill button opens the refill popup with the stock level and the refill action', () => {
            render(<InventoryPage />);

            fireEvent.click(screen.getAllByRole('button', { name: 'Påfyllnad' })[1]);
            render(lastOpenedModal());

            const popup = screen.getByTestId('refill-popup');
            expect(popup).toHaveAttribute('data-balance', '12');
            expect(popup).toHaveAttribute('data-suffix', 'st');

            fireEvent.click(screen.getByText('do refill'));
            expect(mockRefillItem).toHaveBeenCalledWith('2', 5);
        });
    });

    describe('deleting', () => {
        const openDeleteDialog = () => {
            render(<InventoryPage />);
            fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
            render(lastOpenedModal());
        };

        it('asks for confirmation and names the product', () => {
            openDeleteDialog();

            expect(screen.getByText('Radera produkt')).toBeInTheDocument();
            expect(screen.getByText('Produkt: Kaffe')).toBeInTheDocument();
            expect(mockDeleteItem).not.toHaveBeenCalled();
        });

        it('deletes the item and closes the modal when confirmed', async () => {
            mockDeleteItem.mockResolvedValueOnce(true);
            openDeleteDialog();

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Radera' }));
            });

            expect(mockDeleteItem).toHaveBeenCalledWith('1');
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
        });

        it('keeps the modal open when the deletion fails', async () => {
            mockDeleteItem.mockResolvedValueOnce(false);
            openDeleteDialog();

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Radera' }));
            });

            expect(mockDeleteItem).toHaveBeenCalledWith('1');
            expect(mockCloseModal).not.toHaveBeenCalled();
        });
    });
});
