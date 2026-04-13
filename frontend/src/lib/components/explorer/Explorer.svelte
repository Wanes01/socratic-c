<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";
    import ExplorerSection from "./ExplorerSection.svelte";

    let currentExercise = $derived(
        fs.selectedExercise ? (fs.fileTree as any)[fs.selectedExercise] : null,
        //fs.fileTree[fs.selectedExercise],
    );
    let studentRoot = $derived(currentExercise?.studentRoot || null);
    let tests = $derived(currentExercise?.tests || null);
</script>

<aside class="flex flex-col w-full h-full py-2">
    <ExerciseSelector />
    {#if currentExercise?.constraints}
        <ExplorerSection title={`vincoli di "${fs.selectedExercise}"`}>
            <p class="px-4 py-1 text-sm text-neutral-400 italic">
                {currentExercise.constraints}
            </p>
        </ExplorerSection>
    {/if}
    <FileTree title="sorgenti" rootNode={studentRoot} />
    {#if fs.hasTests}
        <FileTree title="tests" rootNode={tests} />
    {/if}
</aside>
