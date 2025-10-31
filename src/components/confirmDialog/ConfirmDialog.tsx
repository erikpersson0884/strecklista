import './ConfirmDialog.css'

import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";

interface ConfirmDialogProps {
    title: string;
    confirmButtonText?: string;
    onConfirm: () => void;
    children: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    confirmButtonText = "Godkänn",
    onConfirm,
    children
}) => {
    return (
        <ActionPopupWindow
            title={title}
            acceptButtonText={confirmButtonText}
            onAccept={onConfirm}
            className="confirm-popup"
        >
            {children}
        </ActionPopupWindow>
    );
};

export default ConfirmDialog;