<script>
    import { fs } from "../../state/FileState.svelte";
    import FileTabBar from "./FileTabBar.svelte";
    import FileEditor from "./FileEditor.svelte";
    import { marked } from "marked";
</script>

<div class="flex flex-col w-full h-full">
    <FileTabBar />
    {#each fs.openedFiles as file (file.path)}
        <div
            class="flex-1 min-h-0"
            hidden={file.path !== fs.selectedFile?.path}
        >
            {#if file.extension === ".md"}
                <!-- renders md files as static html -->
                <div class="h-full w-full p-3 overflow-auto markdown">
                    {@html marked(file.initialContent)}
                </div>
            {:else}
                <FileEditor {file} />
            {/if}
        </div>
    {/each}
</div>
