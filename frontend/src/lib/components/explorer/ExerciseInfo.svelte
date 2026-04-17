<script lang="ts">
    import ExplorerDropdown from "./ExplorerDropdown.svelte";
    import { fs } from "../../state/files-state.svelte";

    let currentExercise = $derived(
        fs.selectedExercise ? (fs.fileTree as any)[fs.selectedExercise] : null,
    );

    const keyToTitle: Record<string, string> = {
        description: "descrizione",
        learningGoals: "obiettivi",
        constraints: "vincoli",
    };
</script>

<ExplorerDropdown
    title="info esercizio"
    disabled={fs.selectedExercise === null}
>
    <div
        class="flex flex-col gap-2 mx-2 px-2 py-1 border-l border-neutral-600 bg-neutral-600/10"
    >
        {#each Object.keys(keyToTitle) as exInfo}
            {#if currentExercise[exInfo]}
                <div class="flex flex-col">
                    <p
                        class="text-[0.8rem] font-bold uppercase tracking-widest text-neutral-400 underline underline-offset-3"
                    >
                        {keyToTitle[exInfo]}
                    </p>
                    <p class="text-xs text-neutral-300 leading-relaxed">
                        {currentExercise[exInfo]}
                    </p>
                </div>
            {/if}
        {/each}
    </div>
</ExplorerDropdown>
