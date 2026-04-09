<script lang="ts">
    import { untrack } from "svelte";
    import { indentUnit } from "@codemirror/language";
    import { EditorView, basicSetup } from "codemirror";
    import { keymap } from "@codemirror/view";
    import { indentWithTab } from "@codemirror/commands";
    import { cpp } from "@codemirror/lang-cpp";
    import { Compartment } from "@codemirror/state";
    import { oneDark } from "@codemirror/theme-one-dark";

    let { value = $bindable(""), extension = ".c" } = $props();

    let editorContainer: HTMLElement;
    let view: EditorView;

    // used to dinamically change file extension without having to destroy the component
    const languageConf = new Compartment();

    // helper function to map the file extension to the CodeMirror file extension.
    function getLanguageExtension() {
        return [".c", ".h", ".cpp"].includes(extension) ? cpp() : [];
    }

    const darkBackground = EditorView.theme(
        {
            "&": {
                backgroundColor: "#262626 !important",
            },
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
                color: "#abb2bf", // Numero riga attiva più luminoso
            },
        },
        { dark: true },
    );

    // mounts the editor. Runs only once.
    $effect(() => {
        // untracks the initial value without creating a depencendy
        const initialValue = untrack(() => value);

        view = new EditorView({
            doc: initialValue,
            extensions: [
                basicSetup,
                oneDark,
                darkBackground,
                indentUnit.of("    "),
                keymap.of([indentWithTab]),
                languageConf.of(getLanguageExtension()),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const newValue = update.state.doc.toString();
                        // updates the value only if it has changed
                        if (newValue !== value) {
                            value = newValue;
                        }
                    }
                }),
            ],
            parent: editorContainer,
        });

        return () => {
            if (view) view.destroy();
        };
    });

    // changes editor language if the 'language' prop changes
    $effect(() => {
        if (view) {
            view.dispatch({
                effects: languageConf.reconfigure(getLanguageExtension()),
            });
        }
    });

    // syncronizes the editor value
    $effect(() => {
        /* updates the value if it changes from the outside (ex. when laoding a file),
        updates the editor but only if the text has changed. */
        if (view && value !== view.state.doc.toString()) {
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: value },
            });
        }
    });
</script>

<div bind:this={editorContainer} class="editor-wrapper h-full w-full"></div>

<style>
    .editor-wrapper {
        height: 100%;
        width: 100%;
        background-color: #1e1e1e; /* fallback color to avoid visual glitches on loading */
    }

    .editor-wrapper :global(.cm-editor) {
        height: 100%;
    }

    .editor-wrapper :global(.cm-scroller) {
        height: 100%;
        overflow: auto;
    }
</style>
