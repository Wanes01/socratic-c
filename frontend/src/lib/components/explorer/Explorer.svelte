<script>
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";
    import { appState } from "../../state/app-state.svelte";

    let currentExercise = $derived(
        appState.fileTree[appState.selectedExercise],
    );
    let studentRoot = $derived(currentExercise?.studentRoot || null);
    let tests = $derived(currentExercise?.tests || null);

    let hasTests = $derived(tests !== null && Object.keys(tests).length > 0);
</script>

<div class="flex flex-col w-full h-full py-2">
    <ExerciseSelector />
    <FileTree title="sorgenti" rootNode={studentRoot} />
    {#if hasTests}
        <FileTree title="tests" rootNode={tests} />
    {/if}
</div>
