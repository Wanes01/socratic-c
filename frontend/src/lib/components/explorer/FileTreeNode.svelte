<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import { ui } from "../../state/UIState.svelte";
    import { tick } from "svelte";
    import type { FileNode, ContextMenuOption } from "../../types";
    import FileTreeNode from "./FileTreeNode.svelte";
    import { isValidFileName } from "../../util/utilities";

    let { node }: { node: FileNode } = $props();

    let isOpen = $state(false); // if a directory is open or not
    let isEditing = $state(false); // it the user is changing the file/dir name

    let newName = $state("");
    let inputElement: HTMLInputElement | null = $state(null); // input shown of node rename

    let isCreating = $state<"file" | "directory" | null>(null);
    let newItemName = $state("");
    let createInputElement: HTMLInputElement | null = $state(null); // input shown when creating a node

    const isDirectory = $derived(node.type === "directory");

    // opens the context menu on right click
    const oncontextmenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // the specific operations that can be done on this node
        const options: ContextMenuOption[] = [];

        const unmodifiablePaths = ["root", "tests"].map(
            (top) => `${fs.selectedExercise}/${top}`,
        );

        // top level directories can't be deleted or renamed
        if (!unmodifiablePaths.includes(node.path)) {
            options.push(
                // renames a file/dir
                { label: "Rinomina", icon: "✏️", action: () => onRename() },
                // deletes a file/dir
                { label: "Elimina", icon: "🗑️", action: () => onDelete() },
            );
        }

        if (isDirectory) {
            options.push(
                {
                    label: "Nuovo File",
                    icon: "📄",
                    action: () => onCreate("file"),
                },
                {
                    label: "Nuova Cartella",
                    icon: "📁",
                    action: () => onCreate("directory"),
                },
            );
        }

        ui.openContextMenu(e.clientX, e.clientY, options);
    };

    // user click on a directory/file
    const onclick = () => {
        if (isEditing) {
            return; // do not open the file/dir if the user is renaming it
        }

        if (isDirectory) {
            isOpen = !isOpen;
        } else {
            fs.openFile(node);
        }
    };

    // user double clicked a directory/file to rename it
    const onRename = async () => {
        newName = node.name;
        isEditing = true;
        newName = node.name;
        await tick();
        inputElement?.focus();
        inputElement?.select();
    };

    // user wants to delete a node
    const onDelete = async () => {
        ui.showModal(
            `Elimina ${isDirectory ? "cartella" : "file"}`,
            `Sei sicuro di voler eliminare "${node.name}"?`,
            () => fs.deleteNode(node),
            "Elimina",
            "Mantieni",
        );
    };

    // renames the file
    const submitRename = async () => {
        if (!isEditing) return;

        if (newName !== node.name && isValidFileName(newName)) {
            await fs.renameNode(node, newName);
        }

        isEditing = false;
    };

    // user wants to create a new node
    const onCreate = async (type: "file" | "directory") => {
        isOpen = true; // open the directory to show the input
        isCreating = type;
        newItemName = "";
        await tick();
        createInputElement?.focus();
    };

    const submitCreate = async () => {
        if (!isCreating) return;

        const name = newItemName.trim();
        if (name && isValidFileName(name)) {
            // builds the new node's path
            const newPath = `${node.path}/${name}`;
            await fs.createNode(newPath, isCreating);
        }

        isCreating = null;
    };

    const handleRenameKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") submitRename();
        if (e.key === "Escape") {
            isEditing = false;
            newName = node.name;
        }
    };

    const handleCreateKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") submitCreate();
        if (e.key === "Escape") isCreating = null;
    };

    const getIconColor = (extension: string) => {
        if ([".c", ".h"].includes(extension)) {
            return extension == ".c" ? "text-purple-300" : "text-green-300";
        }
        return "text-orange-300";
    };
</script>

<div class="flex flex-col ml-2">
    <button
        type="button"
        class="flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-left w-full hover:bg-neutral-800/50"
        {onclick}
        {oncontextmenu}
    >
        <div
            class="flex flex-row items-baseline gap-2 {fs.selectedFile?.path ===
            node.path
                ? 'text-white bg-neutral-700 px-0.5 rounded-xs'
                : 'text-neutral-400'}"
        >
            {#if isDirectory}
                <span class="w-4 text-xs">{isOpen ? "📂" : "📁"}</span>
            {:else}
                <span
                    class="text-[10px] font-bold w-4 text-center {getIconColor(
                        node.extension ?? '',
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
                    onkeydown={handleRenameKeyDown}
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

            {#if isCreating}
                <div class="flex items-center gap-2 py-1 px-2 ml-2">
                    <span class="w-4 text-xs"
                        >{isCreating === "file" ? "📄" : "📁"}</span
                    >
                    <input
                        bind:this={createInputElement}
                        bind:value={newItemName}
                        onblur={submitCreate}
                        onkeydown={handleCreateKeyDown}
                        class="bg-neutral-900 text-white border border-neutral-500 px-1 rounded outline-none w-full text-sm"
                        placeholder={isCreating === "file"
                            ? "nome file..."
                            : "nome cartella..."}
                    />
                </div>
            {/if}
        </div>
    {/if}
</div>
