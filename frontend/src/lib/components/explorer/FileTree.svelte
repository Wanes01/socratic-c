<script lang="ts">
    import type { FileNode } from "../../types";
    import FileTreeNode from "./FileTreeNode.svelte";
    import ExplorerSection from "./ExplorerSection.svelte";

    let {
        title,
        rootDir,
    }: { title: string; rootDir: Record<string, FileNode> } = $props();

    // Trasformiamo l'oggetto in array per poterlo iterare facilmente
    let rootNodes = $derived(Object.values(rootDir || {}));
</script>

<ExplorerSection {title}>
    <div class="py-1">
        {#if rootNodes.length > 0}
            {#each rootNodes as node}
                <FileTreeNode {node} />
            {/each}
        {:else}
            <p class="ml-4 text-sm text-neutral-600 italic">
                Nessun file presente
            </p>
        {/if}
    </div>
</ExplorerSection>
