<script>
    import ExerciseSelector from "./ExerciseSelector.svelte";
    import FileTree from "./FileTree.svelte";
    import { appState } from "../../state/app-state.svelte";
</script>

<div class="flex flex-col w-full h-full py-2">
    <ExerciseSelector />
    <FileTree
        title="sorgenti"
        rootDir={appState.fileTree[appState.selectedExercise]?.studentRoot}
    />
</div>
