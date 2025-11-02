import './ConfirmDialog.css'

import ActionPopupWindow from "../actionPopupWindow/ActionPopupWindow";

interface ConfirmDialogProps {
    title: string;
    confirmButtonText?: string;
    onConfirm: () => void;
    children: React.ReactNode;
    errorText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    confirmButtonText = "Godkänn",
    onConfirm,
    children,
    errorText
}) => {
    return (
        <ActionPopupWindow
            title={title}
            acceptButtonText={confirmButtonText}
            onAccept={onConfirm}
            className="confirm-popup"
            errorText={errorText}
        >
            {children}
        </ActionPopupWindow>
    );
};

export default ConfirmDialog;