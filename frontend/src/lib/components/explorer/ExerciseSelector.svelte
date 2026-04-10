<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import { stringToColor } from "../../util/utilities";
    import ExplorerSection from "./ExplorerSection.svelte";

    // the list of available exercises
    let exercises = $derived(Object.keys(fs.fileTree));
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
                    onclick={() => {
                        fs.selectedExercise = exName;
                    }}
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
