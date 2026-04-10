<script lang="ts">
    // In futuro qui collegheremo TerminalState.ts
</script>

<div class="flex flex-col w-full h-full bg-neutral-950 font-mono">
    <div
        class="flex items-center justify-between px-3 pb-1 pt-2 bg-neutral-900 border-b border-white/5 select-none"
    >
        <span
            class="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >OUTPUT DEL PROGRAMMA</span
        >
    </div>

    <div
        class="flex-1 overflow-y-auto p-3 text-sm leading-relaxed custom-scrollbar"
    >
        <!-- QUI SCRITTI OUTPUT ED ERROR DEL PROGRAMMA -->
    </div>

    <div class="flex items-center border-t border-white/5 bg-neutral-900 px-3">
        <span class="text-violet-400 font-bold mr-2">&gt;</span>
        <input
            type="text"
            name="args"
            placeholder="Scrivi qui gli argomenti o l'input per il programma..."
            class="w-full py-2 bg-transparent text-gray-200 text-sm outline-none placeholder:text-neutral-600"
        />
    </div>
</div>

<style>
    /* Una scrollbar sottile per non rovinare il look */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>
