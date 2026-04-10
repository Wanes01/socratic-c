<script lang="ts">
    interface Props {
        text: string;
        icon?: string;
        variant?: "navBar" | "ai";
        onclick?: () => void;
    }

    let { text, icon, variant = "navBar", onclick }: Props = $props();

    const baseClass =
        "flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer";

    const variants = {
        navBar: "bg-neutral-700 hover:bg-neutral-600 text-neutral-200 border border-neutral-600 hover:border-neutral-500",
        ai: "bg-gradient-to-r from-violet-800/50 to-indigo-800/50 hover:from-violet-700/60 hover:to-indigo-700/60 text-violet-100 border border-violet-600/40",
    };
</script>

<button class="{baseClass} {variants[variant]}" {onclick}>
    {#if icon}
        <img src={icon} alt="" class="h-4 w-4 opacity-80" />
    {/if}
    <span>{text}</span>
</button>
