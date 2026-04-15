<script lang="ts">
    import { ui } from "../../state/UIState.svelte";
    import { fly } from "svelte/transition";
    import { backOut } from "svelte/easing";

    const themes = {
        info: "border-neutral-700 bg-neutral-800 text-neutral-200 shadow-lg shadow-purple-400",
        success: "border-emerald-900/50 bg-neutral-800 text-emerald-400",
        error: "border-red-900/50 bg-neutral-800 text-red-400",
    };
</script>

<div
    class="fixed inset-0 flex items-center justify-center pointer-events-none z-9999"
>
    <div
        transition:fly={{ y: 20, duration: 400, easing: backOut }}
        class="px-6 py-3 rounded-sm border shadow-2xl pointer-events-auto
                   flex items-center gap-3 max-w-md
                   {themes[ui.toast?.type || 'info']}"
    >
        <p class="text-sm font-medium tracking-wide">
            {ui.toast?.message}
        </p>
    </div>
</div>
