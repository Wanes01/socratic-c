<script lang="ts">
    import { cs } from "../../state/ChatState.svelte";
    import Dropdown from "../ui/Dropdown.svelte";
</script>

<Dropdown label="Modello chat">
    <div class="flex flex-col min-w-60 p-1.5 gap-1">
        {#each cs.models as modelOption}
            {@const isLocal = modelOption.provider === "ollama"}
            {@const isSelected = cs.selectedProvider === modelOption.provider}
            {@const isAvailable = modelOption.available}

            <button
                onclick={() =>
                    isAvailable && (cs.selectedProvider = modelOption.provider)}
                disabled={!isAvailable}
                class="w-full text-left px-3 py-2 rounded-sm transition-all duration-150 border disabled:cursor-not-allowed cursor-pointer
                {!isAvailable
                    ? 'opacity-50 border-transparent grayscale-[0.5]'
                    : isSelected
                      ? 'bg-violet-600/20 text-violet-400 border-violet-600/30'
                      : 'hover:bg-neutral-700/50 text-neutral-400 border-transparent'}"
            >
                <div class="flex items-center justify-between gap-3">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                            <span
                                class="text-sm font-medium {isSelected
                                    ? 'text-violet-300'
                                    : 'text-neutral-200'}"
                            >
                                {modelOption.model}
                            </span>
                            {#if !isAvailable}
                                <span
                                    class="text-[9px] text-red-400 font-bold mt-2 uppercase tracking-tighter"
                                >
                                    Offline
                                </span>
                            {/if}
                        </div>

                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span
                                class="text-[10px] uppercase tracking-wider opacity-60"
                            >
                                {modelOption.provider}
                            </span>
                        </div>
                    </div>

                    <span
                        class="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase
                        {isLocal
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-sky-500/10 text-sky-500 border border-sky-500/20'}"
                    >
                        {isLocal ? "local" : "cloud"}
                    </span>
                </div>
            </button>
        {/each}

        {#if cs.models.length === 0}
            <div class="py-4 px-2 text-center">
                <p class="text-neutral-500 italic">
                    Nessun modello configurato
                </p>
                <p class="text-neutral-600 mt-1">
                    Controlla il file .env o Ollama
                </p>
            </div>
        {/if}
    </div>
</Dropdown>
