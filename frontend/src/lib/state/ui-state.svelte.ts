import type { ContextMenuState, ModalState, ContextMenuOption, ToastState } from "../types/ui-types"

class UIState {
    contextMenu = $state<ContextMenuState | null>(null);
    modal = $state<ModalState | null>(null);
    toast = $state<ToastState | null>(null);
    private toastTimer: any = null;

    // closes the context menu
    closeContextMenu(): void {
        this.contextMenu = null;
    }

    // opens the context menu in a specific position
    openContextMenu(x: number, y: number, options: ContextMenuOption[]): void {
        this.contextMenu = { x, y, options };
    }

    // shows the confirmation modal
    showModal(
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        confirmText: string = "Conferma",
        cancelText: string = "Annulla"
    ): void {
        this.modal = { title, message, onConfirm, confirmText, cancelText };
    }

    // closes the confirmation modal
    closeModal(): void {
        this.modal = null;
    }

    // shows a toast for the specified amount of time
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