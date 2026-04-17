<script lang="ts">
    import ExplorerDropdown from "./ExplorerDropdown.svelte";
    import { fs } from "../../state/files-state.svelte";

    let currentExercise = $derived(
        fs.selectedExercise ? (fs.fileTree as any)[fs.selectedExercise] : null,
    );

    const sections: { key: string; label: string }[] = [
        { key: "description", label: "Descrizione" },
        { key: "learningGoals", label: "Obiettivi" },
        { key: "constraints", label: "Vincoli" },
    ];
</script>

<ExplorerDropdown
    title="info esercizio"
    disabled={fs.selectedExercise === null}
>
    <div class="flex flex-col divide-y divide-neutral-700/50 px-4 py-1">
        {#each sections as { key, label }}
            {#if currentExercise?.[key]}
                <div class="flex flex-col gap-0.5 py-2">
                    <span
                        class="text-[0.65rem] font-medium uppercase tracking-widest text-neutral-500"
                    >
                        {label}
                    </span>
                    <p class="text-[0.75rem] leading-relaxed text-neutral-300">
                        {currentExercise[key]}
                    </p>
                </div>
            {/if}
        {/each}
    </div>
</ExplorerDropdown>
