import ActionPopupWindow from "../../components/actionPopupWindow/ActionPopupWindow";
import React from "react";
import { useInventory } from "../../contexts/InventoryContext";

interface DeleteProductPopupProps {
    item: IItem | null;
    onClose: () => void;
}

const DeleteProductPopup: React.FC<DeleteProductPopupProps> = ({item, onClose}) => {
    if (!item) return null;
    
    const { deleteProduct } = useInventory();

    const [ errorText , setErrorText ] = React.useState<string>("");

    const handleDelete = async () => {
        try {
            await deleteProduct(item.id);
            handleClose();
        } catch (error) {
            setErrorText("Något gick fel, försök igen senare.");
        }
    }

    const handleClose = () => {
        setErrorText("");
        onClose();
    }

    return (
        <ActionPopupWindow 
            isOpen={!!item} 
            onClose={handleClose}
            title="Radera Item"
            acceptButtonText="Radera"
            onAccept={handleDelete}
        >
            <p>Är du säker på att du vill radera produkten?</p>
            <p>Produkt: <span className="red-text">{item.name}</span></p>
            {errorText && <div className="error-message">{errorText}</div>}
        </ActionPopupWindow>
    )
}

export default DeleteProductPopup;
