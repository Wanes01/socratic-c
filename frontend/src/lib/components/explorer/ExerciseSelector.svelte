<script lang="ts">
    import type { ContextMenuOption } from "../../types/ui-types";
    import { fs } from "../../state/files-state.svelte";
    import { ts } from "../../state/terminal-state.svelte";
    import { ui } from "../../state/ui-state.svelte";
    import { cs } from "../../state/chat-state.svelte";
    import ExplorerDropdown from "./ExplorerDropdown.svelte";

    $inspect(fs.fileTree);

    // the list of available exercises
    let exercises = $derived(Object.keys(fs.fileTree));

    // exercises operations
    const oncontextmenu = (e: MouseEvent, exerciseName: string): void => {
        e.preventDefault();
        e.stopPropagation();

        const options: ContextMenuOption[] = [
            {
                label: "Scarica come zip",
                icon: "🗃️",
                action: () => {
                    fs.downloadExercise(exerciseName);
                },
            },
        ];

        ui.openContextMenu(e.clientX, e.clientY, options);
    };

    // user selects an exercise
    const onclick = (exerciseName: string): void => {
        // another exersicise is already selected. Cleans chat history.
        if (fs.selectedExercise) {
            cs.cleanChat();
        }

        fs.selectedExercise = exerciseName;

        // if the exercise has a test folder, include it by default in the compilation process
        if (fs.hasTests) {
            ts.compileOptions.includeTests = true;
        }
    };
</script>

<ExplorerDropdown title="esercizi" openOnMount={true}>
    <ul class="flex flex-col w-full py-1">
        {#each exercises as exName}
            {@const isSelected = fs.selectedExercise === exName}
            <li class="relative">
                {#if isSelected}
                    <div
                        class="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-400 rounded-r-full"
                    ></div>
                {/if}
                <button
                    type="button"
                    class="flex items-center w-full px-3 py-1 cursor-pointer transition-colors text-left gap-2
                           {isSelected
                        ? 'text-neutral-100 bg-neutral-700/50'
                        : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300'}"
                    onclick={() => onclick(exName)}
                    oncontextmenu={(e) => oncontextmenu(e, exName)}
                >
                    <svg
                        class="w-3 h-3 shrink-0 transition-colors
                               {isSelected
                            ? 'text-violet-400'
                            : 'text-neutral-600'}"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2 6h8M6 2l4 4-4 4"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                    <span class="truncate">{exName}</span>
                </button>
            </li>
        {/each}
    </ul>
</ExplorerDropdown>
