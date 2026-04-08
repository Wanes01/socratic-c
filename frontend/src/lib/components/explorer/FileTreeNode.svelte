<script lang="ts">
    import type { FileNode } from "../../types";
    import FileTreeNode from "./FileTreeNode.svelte";

    let { node }: { node: FileNode } = $props();
    let isOpen = $state(false);

    const isDirectory = $derived(node.type === "directory");
</script>

<div class="flex flex-col ml-4">
    <button
        type="button"
        class="flex items-center gap-2 py-1 px-2 hover:bg-neutral-800 rounded cursor-pointer text-left w-full"
        onclick={() => (isOpen = !isOpen)}
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
        <span
            class={isDirectory
                ? "font-semibold text-neutral-300"
                : "text-neutral-400"}
        >
            {node.name}
        </span>
    </button>

    {#if isDirectory && isOpen && node.children}
        <div class="border-l border-neutral-700 ml-2">
            {#each Object.values(node.children) as child}
                <FileTreeNode node={child} />
            {/each}
        </div>
    {/if}
</div>
