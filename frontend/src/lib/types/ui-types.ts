/**
 * An option that can be selected from a menu
 */
export interface ContextMenuOption {
    label: string;
    icon?: string;
    action: () => void | Promise<void>;
}

/**
 * The location and options in a menu
 */
export interface ContextMenuState {
    x: number;
    y: number;
    options: ContextMenuOption[];
}

/**
 * The characteristics of a blocking modal
 */
export interface ModalState {
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    confirmText: string;
    cancelText: string;
}

/**
 * An informational message
 */
export interface ToastState {
    message: string;
    type: "info" | "success" | "error";
}