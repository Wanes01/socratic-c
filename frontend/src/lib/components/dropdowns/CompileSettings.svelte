<script lang="ts">
    import { fs } from "../../state/files-state.svelte";
    import { ts } from "../../state/terminal-state.svelte";
    import Dropdown from "../ui/Dropdown.svelte";

    const options = [
        { key: "includeTests", label: "Includi i test" },
        { key: "ansi", label: "ANSI C (C89/C90)" },
        { key: "wall", label: "-Wall" },
        { key: "wpedantic", label: "-Wpedantic" },
        { key: "wextra", label: "-Wextra" },
        { key: "werror", label: "-Werror" },
    ] as const;

    // if the exercise does not have an exercise dir, exclude tests by default
    $effect(() => {
        if (!fs.hasTests) {
            ts.compileOptions.includeTests = false;
        }
    });
</script>

<Dropdown label="Compilazione">
    <div class="px-3 py-2 flex flex-col gap-2">
        {#each options as opt}
            <div>
                <label
                    class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
                >
                    <input
                        type="checkbox"
                        checked={ts.compileOptions[opt.key]}
                        onchange={(e) =>
                            (ts.compileOptions[opt.key] =
                                e.currentTarget.checked)}
                        class="accent-purple-400 disabled:cursor-not-allowed enabled:cursor-pointer"
                        disabled={opt.key === "includeTests" && !fs.hasTests}
                    />
                    <span
                        class={opt.key === "includeTests" && !fs.hasTests
                            ? "line-through"
                            : ""}>{opt.label}</span
                    >
                </label>
                {#if opt.key === "includeTests"}
                    <p
                        class="mt-1 text-xs text-neutral-400 border-l border-neutral-600 pl-2"
                    >
                        💡 Se compili con i test, chiama il tuo file principale <span
                            class="font-mono text-neutral-400">main.c</span
                        >, così che venga escluso. (il framework di test
                        fornisce il proprio main e i due non possono coesistere)
                    </p>
                {/if}
            </div>
        {/each}
    </div>
</Dropdown>
