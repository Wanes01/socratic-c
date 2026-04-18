import type { ContextMenuState, ModalState, ContextMenuOption, ToastState } from "../types/ui-types"

class UIState {
    contextMenu = $state<ContextMenuState | null>(null);
    modal = $state<ModalState | null>(null);
    toast = $state<ToastState | null>(null);
    private toastTimer: any = null;

    /**
     * closes the context menu
     */
    closeContextMenu(): void {
        this.contextMenu = null;
    }

    /**
     * opens the context menu in (x, y) relative to the viewport
     * @param x the horizontal coordinate relative to the viewport
     * @param y the vertical coordinate relative to the viewport
     * @param options the options to show in the context menu
     */
    openContextMenu(x: number, y: number, options: ContextMenuOption[]): void {
        this.contextMenu = { x, y, options };
    }

    /**
     * shows the confirmation modal
     * @param title the title of the modal
     * @param message the main message representing why the modal was shown
     * @param onConfirm the action to perform on confirmation
     * @param confirmText the text on the confirmation button
     * @param cancelText the text on the cancel button
     */
    showModal(
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        confirmText: string = "Conferma",
        cancelText: string = "Annulla"
    ): void {
        this.modal = { title, message, onConfirm, confirmText, cancelText };
    }

    /**
     * closes the confirmation modal
     */
    closeModal(): void {
        this.modal = null;
    }

    /**
     * shows a toast for the specified amount of time
     * @param message the message to show in the toast
     * @param type the style the toast will be using
     * @param duration how long the toast will stay on screen in milliseconds
     */
    showToast(message: string, type: "info" | "success" | "error" = "info", duration: number = 3000): void {
        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toast = { message, type };

        this.toastTimer = setTimeout(() => {
            this.toast = null;
            this.toastTimer = null;
        }, duration);
    }
}

export const ui = new UIState();