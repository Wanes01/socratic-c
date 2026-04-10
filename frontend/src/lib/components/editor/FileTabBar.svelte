<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import type { OpenedFile } from "../../types";

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
    class="flex flex-row w-full bg-neutral-800 text-white select-none overflow-x-auto border-b border-b-[#333333]"
>
    {#each fs.openedFiles as file (file.path)}
        {@const isSelected = file.path === fs.selectedFile?.path}
        <li
            class="flex items-center border-r border-neutral-900 transition-colors cursor-pointer {isSelected
                ? 'bg-neutral-700'
                : 'hover:bg-neutral-750'}"
        >
            <button
                type="button"
                onclick={() => onTabClick(file)}
                class="cursor-pointer py-2 pl-4 pr-2 flex items-center gap-2 transition-colors {isSelected
                    ? 'text-white'
                    : 'text-neutral-400'}"
            >
                <span class="text-sm truncate max-w-37.5">{file.name}</span>
            </button>
            <button
                type="button"
                aria-label="Chiudi {file.name}"
                onclick={() => onCrossClick(file)}
                class="mr-2 p-1 rounded hover:bg-neutral-600 transition-opacity group cursor-pointer"
            >
                <img src="close.svg" alt="" class="h-3 w-3 brightness-200" />
            </button>
        </li>
    {/each}
</ul>
