<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import { slide } from "svelte/transition";

    let isOpen = $state(false);

    let currentExercise = $derived(
        fs.selectedExercise ? (fs.fileTree as any)[fs.selectedExercise] : null,
    );

    const keyToTitle: Record<string, string> = {
        description: "descrizione",
        learningGoals: "obiettivi",
        constraints: "vincoli",
    };
</script>

{#if currentExercise}
    <div class="flex flex-col w-full py-2">
        <button
            type="button"
            class="flex items-center gap-4 px-4 mb-2 cursor-pointer group"
            onclick={() => (isOpen = !isOpen)}
        >
            <p
                class="tracking-widest text-neutral-300 text-[0.75rem] font-bold uppercase"
            >
                info esercizio
            </p>
            <svg
                class="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:opacity-100 {isOpen
                    ? 'rotate-180'
                    : ''}"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M2 4L6 8L10 4"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>

        {#if isOpen}
            <div
                class="flex flex-col gap-2 mx-2 px-2 py-1 border-l border-neutral-600 bg-purple-100/5"
                transition:slide={{ duration: 200 }}
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
        {/if}
    </div>
{/if}
