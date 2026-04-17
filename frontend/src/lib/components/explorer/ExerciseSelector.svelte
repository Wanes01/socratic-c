<script lang="ts">
    import { fs } from "../../state/files-state.svelte";
    import { ts } from "../../state/terminal-state.svelte";
    import { ui } from "../../state/ui-state.svelte";
    import { cs } from "../../state/chat-state.svelte";
    import type { ContextMenuOption } from "../../types";
    import ExplorerDropdown from "./ExplorerDropdown.svelte";

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
    <ul class="flex flex-col w-full">
        {#each exercises as exName}
            {@const isSelected = fs.selectedExercise === exName}
            <li
                class="w-full {isSelected
                    ? 'border-l-2 border-violet-400'
                    : ''}"
            >
                <button
                    type="button"
                    class="flex items-center w-full gap-3 px-4 py-1 cursor-pointer transition-colors text-left
                           {isSelected
                        ? 'bg-neutral-700 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'}"
                    onclick={() => onclick(exName)}
                    oncontextmenu={(e) => oncontextmenu(e, exName)}
                >
                    <span class="text-sm font-medium">{exName}</span>
                </button>
            </li>
        {/each}
    </ul>
</ExplorerDropdown>
