<script lang="ts">
    import type { FileNode } from "../../types";
    import type { Snippet } from "svelte";
    import FileTreeNode from "./FileTreeNode.svelte";
    import ExplorerSection from "./ExplorerSection.svelte";

    interface Props {
        title: string;
        rootNode: FileNode | null;
        toolTip?: Snippet;
    }

    let { title, rootNode, toolTip }: Props = $props();
</script>

<ExplorerSection {title} {toolTip}>
    <div class="py-1">
        {#if rootNode}
            <FileTreeNode node={rootNode} />
        {:else}
            <p class="ml-4 text-sm text-neutral-600 italic">
                Nessun file presente
            </p>
        {/if}
    </div>
</ExplorerSection>
