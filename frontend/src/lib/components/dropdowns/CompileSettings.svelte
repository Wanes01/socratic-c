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

    // if the selected exercise does not have tests, do not include them by default
    $effect(() => {
        if (!fs.hasTests) {
            ts.compileOptions.includeTests = false;
        }
    });
</script>

<Dropdown label="Compilazione">
    <div class="flex flex-col py-1">
        {#each options as opt}
            {@const disabled = opt.key === "includeTests" && !fs.hasTests}
            <label
                class="flex flex-col px-3 py-1.5 gap-1 cursor-pointer
                       hover:bg-neutral-700/40 transition-colors
                       {disabled ? 'opacity-40 cursor-not-allowed' : ''}"
            >
                <div class="flex items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={ts.compileOptions[opt.key]}
                        onchange={(e) =>
                            (ts.compileOptions[opt.key] =
                                e.currentTarget.checked)}
                        {disabled}
                        class="accent-purple-400 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span
                        class="text-sm text-neutral-300 {disabled
                            ? 'line-through'
                            : ''}"
                    >
                        {opt.label}
                    </span>
                </div>
                {#if opt.key === "includeTests"}
                    <p class="text-xs text-neutral-500 pl-5 leading-relaxed">
                        Chiama il tuo file principale
                        <span class="font-mono text-neutral-400">main.c</span>
                        per evitare conflitti con il main del framework di test.
                    </p>
                {/if}
            </label>
        {/each}
    </div>
</Dropdown>
