<script lang="ts">
    import { untrack } from "svelte";
    import { EditorView, basicSetup } from "codemirror";
    import { cpp } from "@codemirror/lang-cpp";
    import { Compartment } from "@codemirror/state";
    import { dracula } from "thememirror";

    let { value = $bindable(""), language = ".c" } = $props();

    let editorContainer: HTMLElement;
    let view: EditorView;

    // used to dinamically change file extension without having to destroy the component
    const languageConf = new Compartment();

    // helper function to map the file extension to the CodeMirror file extension.
    function getLanguageExtension(ext: string) {
        if (ext === ".c" || ext === ".h" || ext === ".cpp") {
            return cpp();
        }
        // do not use a specific language: treats the file as plain text.
        return [];
    }

    // color of the selected text region
    const customSelectionTheme = EditorView.theme({
        // forces the selection color to override the active line color
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
            {
                backgroundColor: "rgba(189, 147, 249, 0.3) !important",
            },

        // active line color
        "&.cm-focused .cm-activeLine": {
            backgroundColor: "rgba(68, 71, 90, 0.5) !important",
        },

        // forces CodeMirror to show the selection layer on top of the active line
        ".cm-selectionLayer": {
            zIndex: "10 !important",
        },
        ".cm-layer.cm-selectionLayer": {
            display: "block !important",
        },
    });

    // mounts the editor. Runs only once.
    $effect(() => {
        // untracks the initial value without creating a depencendy
        const initialValue = untrack(() => value);

        view = new EditorView({
            doc: initialValue,
            extensions: [
                basicSetup,
                dracula,
                customSelectionTheme,
                languageConf.of(getLanguageExtension(language)),
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
                effects: languageConf.reconfigure(
                    getLanguageExtension(language),
                ),
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
    /* a custom class used because CodeMirror does not have a default size */
    .editor-wrapper :global(.cm-editor) {
        height: 100%;
        outline: none !important;
    }
    .editor-wrapper :global(.cm-scroller) {
        font-family: "Fira Code", monospace;
    }
</style>
