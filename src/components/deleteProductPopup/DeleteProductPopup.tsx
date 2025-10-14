import ActionPopupWindow from "../../components/actionPopupWindow/ActionPopupWindow";
import React from "react";
import { useInventory } from "../../contexts/InventoryContext";

interface DeleteProductPopupProps {
    product: IProduct | null;
    onClose: () => void;
}

const DeleteProductPopup: React.FC<DeleteProductPopupProps> = ({product, onClose}) => {
    if (!product) return null;
    
    const { deleteProduct } = useInventory();

    const [ errorText , setErrorText ] = React.useState<string>("");

    const handleDelete = async () => {
        try {
            await deleteProduct(product.id);
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
            isOpen={!!product} 
            onClose={handleClose}
            title="Radera Product"
            acceptButtonText="Radera"
            onAccept={handleDelete}
        >
            <p>Är du säker på att du vill radera produkten?</p>
            <p>Produkt: <span className="red-text">{product.name}</span></p>
            {errorText && <div className="error-message">{errorText}</div>}
        </ActionPopupWindow>
    )
}

export default DeleteProductPopup;
