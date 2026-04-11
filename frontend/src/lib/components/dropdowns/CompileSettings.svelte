<script lang="ts">
    import { ts } from "../../state/TerminalState.svelte";
    import Dropdown from "../ui/Dropdown.svelte";
</script>

<Dropdown label="Compilazione">
    <div class="px-3 py-2 flex flex-col gap-2">
        <label
            class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
        >
            <input
                type="checkbox"
                bind:checked={ts.compileOptions.ansi}
                class="accent-purple-400"
            />
            <span>ANSI C (C89)</span>
        </label>
        <label
            class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
        >
            <input
                type="checkbox"
                bind:checked={ts.compileOptions.wall}
                class="accent-purple-400"
            />
            <span>-Wall</span>
        </label>
        <label
            class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
        >
            <input
                type="checkbox"
                bind:checked={ts.compileOptions.wpedantic}
                class="accent-purple-400"
            />
            <span>-Wpedantic</span>
        </label>
        <label
            class="flex items-center gap-2 text-sm text-neutral-300 cursor-pointer"
        >
            <input
                type="checkbox"
                bind:checked={ts.compileOptions.wextra}
                class="accent-purple-400"
            />
            <span>-Wextra</span>
        </label>
    </div>
</Dropdown>
