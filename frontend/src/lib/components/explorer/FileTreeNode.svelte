<script lang="ts">
    import { appState } from "../../state/app-state.svelte";
    import { tick } from "svelte";
    import type { FileNode } from "../../types";
    import FileTreeNode from "./FileTreeNode.svelte";

    let { node }: { node: FileNode } = $props();
    let isOpen = $state(false); // if a directory is open or not
    let isEditing = $state(false); // it the user is changing the file/dir name
    // svelte-ignore state_referenced_locally
    let newName = $state(node.name);
    let inputElement: HTMLInputElement | null = $state(null);

    const isDirectory = $derived(node.type === "directory");

    // user click on a directory/file
    const onclick = () => {
        if (isEditing) {
            return; // do not open the file/dir if the user is renaming it
        }

        if (isDirectory) {
            isOpen = !isOpen;
        } else {
            appState.openFile(node);
        }
    };

    // user double clicked a directory/file to rename it
    const onRename = async () => {
        isEditing = true;
        newName = node.name;
        await tick();
        inputElement?.focus();
        inputElement?.select();
    };

    // renames the file
    const submitRename = async () => {
        if (!isEditing) return;

        if (newName.trim() !== "" && newName !== node.name) {
            //await appState.renameNode(node, newName);
        }

        isEditing = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") submitRename();
        if (e.key === "Escape") {
            isEditing = false;
            newName = node.name;
        }
    };

    const getIconColor = (extension) => {
        if ([".c", ".h"].includes(extension)) {
            return extension == ".c" ? "text-purple-300" : "text-green-300";
        }
        return "text-orange-300";
    };
</script>

<div class="flex flex-col ml-4">
    <button
        type="button"
        class="flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-left w-full hover:bg-neutral-800/50"
        {onclick}
        ondblclick={onRename}
    >
        <div
            class="flex items-baseline gap-2 {appState.selectedFile?.path ===
            node.path
                ? 'text-white bg-neutral-700 px-0.5 rounded-xs'
                : 'text-neutral-400'}"
        >
            {#if isDirectory}
                <span class="w-4 text-xs">{isOpen ? "📂" : "📁"}</span>
            {:else}
                <span
                    class="text-[10px] font-bold w-4 text-center {getIconColor(
                        node.extension,
                    )}"
                >
                    {node.extension?.replace(".", "").toUpperCase() || "📄"}
                </span>
            {/if}

            {#if isEditing}
                <input
                    bind:this={inputElement}
                    bind:value={newName}
                    onblur={submitRename}
                    onkeydown={handleKeyDown}
                    class="bg-neutral-900 text-white border border-blue-500 px-1 rounded outline-none w-full text-sm"
                />
            {:else}
                <span
                    class="{isDirectory
                        ? 'font-semibold text-neutral-300'
                        : ''} truncate"
                >
                    {node.name}
                </span>
            {/if}
        </div>
    </button>

    {#if isDirectory && isOpen && node.children}
        <div class="border-l border-neutral-600 ml-2">
            {#each Object.values(node.children) as child (child.path)}
                <FileTreeNode node={child} />
            {/each}
        </div>
    {/if}
</div>
