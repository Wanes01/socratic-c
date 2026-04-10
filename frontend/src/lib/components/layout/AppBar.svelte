<script lang="ts">
    import { ts } from "../../state/TerminalState.svelte";
    import Button from "../ui/Button.svelte";
</script>

<div
    class="flex flex-row px-4 py-2 justify-between items-center bg-neutral-900 border-b border-neutral-800 select-none"
>
    <div class="flex items-center gap-2">
        <p class="font-mono font-black text-xl tracking-tighter text-white">
            socrati<span class="text-purple-400">c_c</span>
        </p>
    </div>

    <div class="flex flex-row gap-2">
        <Button
            text="Compila"
            icon="compile.svg"
            variant="navBar"
            disabled={ts.isCompiling}
            onclick={() => console.log("compila")}
        />

        <Button
            text="Esegui"
            icon="run.svg"
            variant="navBar"
            disabled={ts.isCompiling || ts.isExecuting || !ts.canExecute}
            onclick={() => console.log("esegui")}
        />

        <!-- separator -->
        <div class="w-px h-6 bg-neutral-800 mx-1 self-center"></div>
        <Button text="Chiedi all'IA" icon="bot.svg" variant="ai" />
    </div>
</div>
