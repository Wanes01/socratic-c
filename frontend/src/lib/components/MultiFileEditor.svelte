<script>
    import { appState } from "../state/app-state.svelte";

    let openFiles = $derived(appState.openedFiles);
</script>

<div class="flex flex-col w-full">
    <!-- Tabs -->
    <ul class="flex flex-row w-full bg-neutral-700 text-white">
        {#each openFiles as file}
            <li
                class="border-r-2 border-r-neutral-800 last:border-r-0 py-1 px-2 flex flex-row items-center gap-1"
            >
                <p class="pb-0.5">{file.name}</p>
                <button
                    class="text-xs hover:rounded-full hover:bg-neutral-800 p-0.5 cursor-pointer"
                >
                    <img src="close.svg" alt="close" class="h-3" />
                </button>
            </li>
        {/each}
    </ul>
</div>
