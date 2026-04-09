<script>
    import { appState } from "../state/app-state.svelte";

    let openFiles = $derived(appState.openedFiles);

    // user clicks on a tab
    const onTabClick = (file) => {
        appState.selectedFile = file;
    };

    // user clicks on a tab's cross
    const onCrossClick = (file) => {
        appState.openedFiles = appState.openedFiles.filter(
            (f) => f.path !== file.path,
        );

        // the closed file is the currently selected one
        if (appState.selectedFile?.path === file.path) {
            // if another file is open in the editor, show that one
            appState.selectedFile =
                appState.openedFiles.length > 0
                    ? appState.openedFiles[0]
                    : null;
        }

        // TODO: SAVE THE FILE
    };
</script>

<ul
    class="flex flex-row w-full bg-neutral-800 text-white select-none overflow-x-auto border-b border-b-[#333333]"
>
    {#each openFiles as file}
        {@const isSelected = file.path === appState.selectedFile?.path}

        <li
            class="flex items-center border-r border-neutral-900 transition-colors cursor-pointer {isSelected
                ? 'bg-neutral-700'
                : 'hover:bg-neutral-750'}"
        >
            <button
                type="button"
                onclick={() => {
                    onTabClick(file);
                }}
                class="cursor-pointer py-2 pl-4 pr-2 flex items-center gap-2 transition-colors
                       {isSelected ? 'text-white' : 'text-neutral-400'}"
            >
                <span class="text-sm truncate max-w-37.5">{file.name}</span>
            </button>

            <button
                type="button"
                aria-label="Chiudi {file.name}"
                onclick={() => {
                    onCrossClick(file);
                }}
                class="mr-2 p-1 rounded hover:bg-neutral-600 transition-opacity group cursor-pointer"
            >
                <img src="close.svg" alt="" class="h-3 w-3 brightness-200" />
            </button>
        </li>
    {/each}
</ul>
