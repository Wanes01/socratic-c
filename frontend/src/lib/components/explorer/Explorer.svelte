<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";
    import ExerciseInfo from "./ExerciseInfo.svelte";

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
        <FileTree title="tests" rootNode={tests} />
    {/if}
</aside>
