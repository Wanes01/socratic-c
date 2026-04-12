<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import { untrack } from "svelte";
    import { indentUnit } from "@codemirror/language";
    import { EditorView, basicSetup } from "codemirror";
    import { keymap } from "@codemirror/view";
    import { indentWithTab } from "@codemirror/commands";
    import { cpp } from "@codemirror/lang-cpp";
    import { Compartment } from "@codemirror/state";
    import { oneDark } from "@codemirror/theme-one-dark";

    let { file } = $props(); // { path, name, extension, initialContent }

    /* freezes the values on component creation with non reactive variables */
    const initialContent = untrack(() => file.initialContent);
    const filePath = untrack(() => file.path);
    const fileExtension = untrack(() => file.extension);

    let editorContainer: HTMLElement;
    let view: EditorView;
    const languageConf = new Compartment();

    let saved = $state(false);
    let saveTimeout: ReturnType<typeof setTimeout>;

    // prevents the toast to appear multiple times if the user spams the save shortcut
    function showSavedFeedback() {
        saved = true;
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => (saved = false), 2000);
    }

    function getLanguageExtension() {
        return [".c", ".h", ".cpp"].includes(fileExtension) ? cpp() : [];
    }

    const darkBackground = EditorView.theme(
        {
            "&": { backgroundColor: "#262626 !important" },
            ".cm-gutters": {
                backgroundColor: "#1a1a1a !important",
                color: "#5c6370",
                border: "none",
            },
            ".cm-activeLine": {
                backgroundColor: "rgba(255, 255, 255, 0.03) !important",
            },
            ".cm-activeLineGutter": {
                backgroundColor: "transparent",
                color: "#abb2bf",
            },
        },
        { dark: true },
    );

    // runs only on component mount
    $effect(() => {
        view = new EditorView({
            doc: initialContent,
            extensions: [
                basicSetup,
                oneDark,
                darkBackground,
                indentUnit.of("    "), // default indentation to 4 spaces
                keymap.of([
                    indentWithTab, // maps the 'Tab' key to indentation in the editor
                    {
                        key: "Mod-s", // maps 'ctrl + s' to a function that saves the file
                        run: () => {
                            fs.saveFile(file).then(showSavedFeedback);
                            return true;
                        },
                    },
                ]),
                languageConf.of(getLanguageExtension()),
            ],
            parent: editorContainer,
        });

        fs.editorViews[filePath] = view;

        return () => {
            delete fs.editorViews[filePath];
            view.destroy();
        };
    });
</script>

<div class="relative h-full w-full">
    <div bind:this={editorContainer} class="editor-wrapper h-full w-full"></div>
    {#if saved}
        <div
            class="absolute bottom-4 right-4 bg-neutral-700 text-white text-sm px-3 py-1.5 rounded shadow-lg"
        >
            File Salvato
        </div>
    {/if}
</div>

<style>
    .editor-wrapper {
        height: 100%;
        width: 100%;
        background-color: #1e1e1e;
    }
    .editor-wrapper :global(.cm-editor) {
        height: 100%;
    }
    .editor-wrapper :global(.cm-scroller) {
        height: 100%;
        overflow: auto;
    }
</style>
