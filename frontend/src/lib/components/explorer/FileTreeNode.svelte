<script lang="ts">
    import { appState } from "../../state/app-state.svelte";
    import type { FileNode } from "../../types";
    import FileTreeNode from "./FileTreeNode.svelte";

    let { node }: { node: FileNode } = $props();
    let isOpen = $state(false);

    const isDirectory = $derived(node.type === "directory");

    // user click on a directory/file
    const onclick = () => {
        if (isDirectory) {
            isOpen = !isOpen;
        } else {
            appState.openFile(node);
        }
    };
</script>

<div class="flex flex-col ml-4">
    <button
        type="button"
        class="flex items-center gap-2 py-1 px-2rounded cursor-pointer text-left w-full"
        {onclick}
    >
        <!-- colored div background wrapper, visible if file is selected -->
        <div
            class={appState.selectedFilePath === node.path
                ? "bg-neutral-700 pl-0.5 pr-5 rounded-md text-white"
                : "text-neutral-400"}
        >
            {#if isDirectory}
                <span class="w-4">{isOpen ? "📂" : "📁"}</span>
            {:else if node.extension === ".c" || node.extension === ".h"}
                {@const isSourceCode = node.extension === ".c"}
                <span
                    class="{isSourceCode
                        ? 'text-purple-400'
                        : 'text-green-400'} font-bold text-base"
                >
                    {node.extension}
                </span>
            {:else}
                <span class="w-4">📄</span>
            {/if}

            <span class={isDirectory ? "font-semibold text-neutral-300" : ""}>
                {node.name}
            </span>
        </div>
    </button>

    {#if isDirectory && isOpen && node.children}
        <div class="border-l border-neutral-700 ml-2">
            {#each Object.values(node.children) as child}
                <FileTreeNode node={child} />
            {/each}
        </div>
    {/if}
</div>
