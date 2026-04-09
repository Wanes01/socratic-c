<script>
    import { appState } from "../state/app-state.svelte";
    import FileTabBar from "./FileTabBar.svelte";
    import FileEditor from "./FileEditor.svelte";

    let codeProxy = {
        get value() {
            return appState.selectedFile?.content || "";
        },
        set value(newValue) {
            if (appState.selectedFile) {
                appState.selectedFile.content = newValue;
            }
        },
    };
</script>

<div class="flex flex-col w-full h-full">
    <FileTabBar />
    {#if appState.selectedFile?.path}
        <FileEditor
            extension={appState.selectedFile.extension}
            bind:value={codeProxy.value}
        />
    {/if}
</div>
