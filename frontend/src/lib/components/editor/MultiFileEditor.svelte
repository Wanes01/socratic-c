<script>
    import { fs } from "../../state/FileState.svelte";
    import FileTabBar from "./FileTabBar.svelte";
    import FileEditor from "./FileEditor.svelte";
</script>

<div class="flex flex-col w-full h-full">
    <FileTabBar />
    {#each fs.openedFiles as file (file.path)}
        <div
            class="flex-1 min-h-0"
            hidden={file.path !== fs.selectedFile?.path}
        >
            <FileEditor {file} />
        </div>
    {/each}
</div>
