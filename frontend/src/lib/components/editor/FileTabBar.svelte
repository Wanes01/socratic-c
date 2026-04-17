<script lang="ts">
    import { fs } from "../../state/files-state.svelte";
    import type { OpenedFile } from "../../types/files-types";

    const onTabClick = (file: OpenedFile): void => {
        fs.selectedFile = file;
    };

    const onCrossClick = async (file: OpenedFile): Promise<void> => {
        await fs.saveFile(file);
        // removes the metadata of the file that is getting closed
        fs.openedFiles = fs.openedFiles.filter((f) => f.path !== file.path);
        // shows another file that is already open, if it exists
        if (fs.selectedFile?.path === file.path) {
            fs.selectedFile =
                fs.openedFiles.length > 0 ? fs.openedFiles[0] : null;
        }
    };
</script>

<ul
    class="flex flex-row w-full bg-neutral-900 select-none overflow-x-auto border-b border-neutral-800"
>
    {#each fs.openedFiles as file (file.path)}
        {@const isSelected = file.path === fs.selectedFile?.path}
        <li
            class="relative flex items-center cursor-pointer group
                   {isSelected
                ? 'bg-neutral-800'
                : 'bg-neutral-900 hover:bg-neutral-800/60'}
                   border-r border-neutral-800 transition-colors"
        >
            {#if isSelected}
                <div
                    class="absolute top-0 left-0 right-0 h-0.5 bg-violet-400"
                ></div>
            {/if}
            <button
                type="button"
                onclick={() => onTabClick(file)}
                class="py-2 pl-3 pr-1 flex items-center gap-2 transition-colors
                       {isSelected
                    ? 'text-neutral-100'
                    : 'text-neutral-500 group-hover:text-neutral-300'}"
            >
                <span class="truncate max-w-36">{file.name}</span>
            </button>
            <button
                type="button"
                aria-label="Chiudi {file.name}"
                onclick={() => onCrossClick(file)}
                class="mr-2 p-0.5 rounded transition-all cursor-pointer
                       opacity-0 group-hover:opacity-100
                       {isSelected ? 'opacity-100' : ''}
                       hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300"
            >
                <img src="close.svg" alt="" class="h-3 w-3 brightness-150" />
            </button>
        </li>
    {/each}
</ul>
