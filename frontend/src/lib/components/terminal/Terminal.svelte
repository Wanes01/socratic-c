<script lang="ts">
    import { ts } from "../../state/TerminalState.svelte";
    import Button from "../ui/Button.svelte";

    let scrollContainer: HTMLDivElement | null = $state(null);

    // every time the output changes the terminal autoscrolls
    $effect(() => {
        ts.output;
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    });
</script>

<div class="flex flex-col w-full h-full bg-neutral-950 font-mono">
    <div
        class="flex items-center justify-between px-3 pb-1 pt-2 bg-neutral-900 border-b border-white/5 select-none"
    >
        <span
            class="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >Output del programma</span
        >
    </div>

    <div
        bind:this={scrollContainer}
        class="flex-1 overflow-y-auto p-3 text-sm leading-relaxed custom-scrollbar scroll-smooth"
    >
        <pre class="text-gray-300 whitespace-pre-wrap break-all">
            {#if ts.isCompiling}
                <span>Compilazione in corso...</span>
            {:else}
                <span>{ts.output}</span>
            {/if}
        </pre>
    </div>

    <div
        class="flex flex-row items-center border-t border-white/5 bg-neutral-900"
    >
        <div class="flex flex-row px-3 flex-1 items-center">
            <span class="text-violet-400 font-bold mr-2">&gt;</span>
            <input
                type="text"
                bind:value={ts.params}
                placeholder={ts.isExecuting
                    ? "Inserisci input per il programma..."
                    : "Argomenti linea di comando..."}
                class="w-full py-2 bg-transparent text-gray-200 text-sm outline-none placeholder:text-neutral-600"
            />
        </div>
        {#if ts.isExecuting}
            <Button
                text="Invia"
                rounded={false}
                onclick={() => {
                    // sends input data lmao
                }}
            />
        {/if}
    </div>
</div>
