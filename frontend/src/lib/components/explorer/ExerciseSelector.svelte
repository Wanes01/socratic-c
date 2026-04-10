<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import { ui } from "../../state/UIState.svelte";
    import type { ContextMenuOption } from "../../types";
    import { stringToColor } from "../../util/utilities";
    import ExplorerSection from "./ExplorerSection.svelte";

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
        fs.selectedExercise = exerciseName;
    };
</script>

<ExplorerSection title="esercizi">
    <ul class="flex flex-col w-full">
        {#each exercises as exName}
            {@const isSelected = fs.selectedExercise === exName}
            {@const color = stringToColor(exName)}
            <li
                class="w-full"
                style={isSelected ? `border-left: 2px solid ${color};` : null}
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
                    <div
                        class="w-2 h-2 rounded-full shrink-0"
                        style="background-color: {color};"
                    ></div>

                    <span class="text-sm font-medium">{exName}</span>
                </button>
            </li>
        {/each}
    </ul>
</ExplorerSection>
