import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";
import { useInventory } from "../../contexts/InventoryContext";
import React, { useEffect, useState } from "react";

interface UpdateProductPopupProps {
    product: IProduct | null;
    onClose: () => void;
}

const UpdateProductPopup: React.FC<UpdateProductPopupProps> = ({product, onClose}) => {
    if (!product) return null;
    const { updateProduct } = useInventory();


    const [updatedProduct, setUpdatedProduct] = useState(product);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        setIsChanged(
        product.name !== updatedProduct.name ||
        product.internalPrice !== updatedProduct.internalPrice ||
        product.icon !== updatedProduct.icon ||
        product.available !== updatedProduct.available
        );
    }, [updatedProduct, product]);

    const handleUpdate = async () => {
        const successful = await updateProduct(updatedProduct);
        if (successful) handleExit();
        else console.error("Failed to update product");
    };

    const handleExit = () => {
        setUpdatedProduct(product);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setUpdatedProduct((prev) => ({
        ...prev,
        [name]:
            type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value,
        }));
    };

    return (
        <ActionPopupWindow
            title="Update Product"
            acceptButtonText="Update"
            isOpen={true}
            onClose={handleExit}
            acceptButtonDisabled={!isChanged}
            onAccept={handleUpdate}
        >
            <div className="inputdiv">
                <label htmlFor="name">Namn: </label>
                <input
                type="text"
                name="name"
                value={updatedProduct.name}
                onChange={handleChange}
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="price">Pris: </label>
                <input
                type="number"
                name="internalPrice"
                value={updatedProduct.internalPrice}
                onChange={handleChange}
                />
            </div>

            <div className="inputdiv">
                <label htmlFor="icon">Bildlänk: </label>
                <input
                type="text"
                name="icon"
                value={updatedProduct.icon}
                onChange={handleChange}
                />
            </div>

            <div>
                <label htmlFor="available">Tillgänglig: </label>
                <input
                type="checkbox"
                name="available"
                checked={updatedProduct.available}
                onChange={handleChange}
                />
            </div>
        </ActionPopupWindow>
    );
};

export default UpdateProductPopup;
