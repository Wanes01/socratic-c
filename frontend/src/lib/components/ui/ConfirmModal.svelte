<script lang="ts">
    import { ui } from "../../state/UIState.svelte";

    let dialogRef: HTMLDialogElement;

    $effect(() => {
        if (ui.modal) {
            dialogRef.showModal();
        } else {
            dialogRef.close();
        }
    });
</script>

<dialog
    bind:this={dialogRef}
    onclose={() => ui.closeModal()}
    onclick={(e) => e.target === dialogRef && ui.closeModal()}
    class="bg-neutral-800 text-white rounded-lg border border-neutral-700 p-0 backdrop:backdrop-blur-sm fixed"
>
    <div class="p-6 min-w-[320px] max-w-md">
        <h2 class="text-xl font-bold mb-2">{ui.modal?.title}</h2>
        <p class="text-neutral-400 mb-6">{ui.modal?.message}</p>

        <div class="flex justify-end gap-3">
            <button
                onclick={() => ui.closeModal()}
                class="px-4 py-2 rounded hover:bg-neutral-700 transition-colors cursor-pointer text-sm font-medium"
            >
                {ui.modal?.cancelText}
            </button>
            <button
                onclick={() => {
                    ui.modal?.onConfirm();
                    ui.closeModal();
                }}
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer text-sm font-medium shadow-md"
            >
                {ui.modal?.confirmText}
            </button>
        </div>
    </div>
</dialog>

<style>
    dialog {
        margin: auto;
        position: fixed;
        inset: 0;
        display: block;
        pointer-events: none;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.2s ease-in-out;
    }

    dialog[open] {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.6);
    }
</style>
