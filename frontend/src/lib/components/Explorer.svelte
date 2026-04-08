<script>
    import { appState } from "../state/app-state.svelte";
    $inspect(appState.fileTree);
</script>

<div class="flex flex-col w-full h-full py-2">
    <p class="tracking-widers text-neutral-300 ml-3 text-[0.83rem]">ESERCIZI</p>
    <ul class="flex flex-col w-full h-10 border border-white"></ul>
</div>
