<script>
    import { appState } from "../state/app-state.svelte";
    import FileTabBar from "./FileTabBar.svelte";
    import FileEditor from "./FileEditor.svelte";

    let file = $derived(
        appState.openedFiles.find((f) => f.path === appState.selectedFilePath),
    );
    let code = $derived(file?.content || "");
</script>

<div class="flex flex-col w-full h-full">
    <FileTabBar />
    {#if appState.selectedFilePath}
        <FileEditor language=".c" bind:value={code} />
    {/if}
</div>
