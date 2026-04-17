<script lang="ts">
    import { cs } from "../../state/chat-state.svelte";
    import Dropdown from "../ui/Dropdown.svelte";

    $inspect(cs.selectedProvider);
</script>

<Dropdown label="Modello chat">
    <div class="flex flex-col min-w-60 p-1.5 gap-1">
        {#each cs.models as modelOption}
            {@const isLocal = modelOption.provider === cs.LOCAL_PROVIDER}
            {@const isSelected = cs.selectedProvider === modelOption.provider}

            <button
                onclick={() => {
                    if (modelOption.available) {
                        cs.selectedProvider = modelOption.provider;
                    }
                }}
                disabled={!modelOption.available}
                class="w-full text-left px-3 py-2 rounded-sm transition-all duration-150 border disabled:cursor-not-allowed cursor-pointer
                {!modelOption.available
                    ? 'opacity-50 border-transparent grayscale-[0.5]'
                    : isSelected
                      ? 'bg-violet-300/10 border-violet-400/20'
                      : 'hover:bg-neutral-700/50 border-transparent'}"
            >
                <div class="flex items-center justify-between gap-3">
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2">
                            <span class="text-sm font-medium text-neutral-200">
                                {modelOption.model}
                            </span>
                            {#if !modelOption.available}
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
