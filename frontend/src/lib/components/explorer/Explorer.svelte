<script lang="ts">
    import { fs } from "../../state/files-state.svelte";
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";
    import ExerciseInfo from "./ExerciseInfo.svelte";
    import Tooltip from "../ui/Tooltip.svelte";

    let currentExercise = $derived(
        fs.selectedExercise ? (fs.fileTree as any)[fs.selectedExercise] : null,
        //fs.fileTree[fs.selectedExercise],
    );
    let studentRoot = $derived(currentExercise?.studentRoot || null);
    let tests = $derived(currentExercise?.tests || null);
</script>

<aside class="flex flex-col w-full h-full py-2 overflow-y-scroll">
    <ExerciseSelector />
    <ExerciseInfo />
    <FileTree title="sorgenti" rootNode={studentRoot} />
    {#if fs.hasTests}
        {#snippet toolTip()}
            <Tooltip iconSrc="info.svg" position="right">
                <p>
                    <span class="font-bold underline">Nota</span>: se vuoi
                    includere i test nella compilazione e mantenere una funzione
                    <code
                        class="font-mono text-purple-400 bg-neutral-700/40 pt-1"
                        >main()</code
                    >
                    nei tuoi sorgenti, chiama il file principale
                    <code
                        class="font-mono text-purple-400 bg-neutral-700/40 pt-1"
                        >main.c</code
                    >
                    — verrà automaticamente escluso in favore del
                    <code
                        class="font-mono text-purple-400 bg-neutral-700/40 pt-1"
                        >main</code
                    > dei test.
                </p>
            </Tooltip>
        {/snippet}

        <FileTree title="tests" rootNode={tests} {toolTip} />
    {/if}
</aside>
