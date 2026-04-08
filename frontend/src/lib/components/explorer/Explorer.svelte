<script>
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";
    import { appState } from "../../state/app-state.svelte";

    let currentExercise = $derived(
        appState.fileTree[appState.selectedExercise],
    );
    let studentRoot = $derived(currentExercise?.studentRoot || {});
    let tests = $derived(currentExercise?.tests || {});

    let hasTests = $derived(Object.keys(tests).length > 0);
</script>

<div class="flex flex-col w-full h-full py-2">
    <ExerciseSelector />
    <FileTree title="sorgenti" rootDir={studentRoot} />
    {#if hasTests}
        <FileTree title="tests" rootDir={tests} />
    {/if}
</div>
