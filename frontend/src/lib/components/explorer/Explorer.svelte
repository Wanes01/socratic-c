<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";

    let currentExercise = $derived(
        fs.selectedExercise ? (fs.fileTree as any)[fs.selectedExercise] : null,
        //fs.fileTree[fs.selectedExercise],
    );
    let studentRoot = $derived(currentExercise?.studentRoot || null);
    let tests = $derived(currentExercise?.tests || null);

    let hasTests = $derived(tests !== null && Object.keys(tests).length > 0);
</script>

<aside class="flex flex-col w-full h-full py-2">
    <ExerciseSelector />
    <FileTree title="sorgenti" rootNode={studentRoot} />
    {#if hasTests}
        <FileTree title="tests" rootNode={tests} />
    {/if}
</aside>
