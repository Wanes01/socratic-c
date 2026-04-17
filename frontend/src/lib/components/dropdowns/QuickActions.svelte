<script lang="ts">
    import { fs } from "../../state/files-state.svelte";
    import { ui } from "../../state/ui-state.svelte";
    import Dropdown from "../ui/Dropdown.svelte";

    interface QuickAction {
        label: string;
        icon: string;
        action: () => void;
    }

    const actions: QuickAction[] = [
        {
            label: "Salva tutti i file aperti",
            icon: "save.svg",
            action: async () => {
                await fs.saveAllFiles();
                ui.showToast("File salvati", "info", 1000);
            },
        },
    ];
</script>

<Dropdown label="Azioni">
    <ul class="flex flex-col py-1">
        {#each actions as { label, icon, action }}
            <li>
                <button
                    onclick={action}
                    class="flex w-full items-center gap-2.5 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-700/50 hover:text-neutral-100 transition-colors"
                >
                    <img src={icon} alt="" class="size-4 opacity-60" />
                    {label}
                </button>
            </li>
        {/each}
    </ul>
</Dropdown>
