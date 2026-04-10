<script lang="ts">
    interface Props {
        text: string;
        icon?: string;
        variant?: "navBar" | "ai";
        rounded?: boolean;
        disabled?: boolean;
        onclick?: () => void;
    }

    let {
        text,
        icon,
        variant = "navBar",
        rounded = true,
        disabled = false,
        onclick,
    }: Props = $props();

    const baseClass = $derived(
        `${rounded ? "rounded-sm" : ""} flex items-center gap-2 px-3 py-1.5 text-sm ` +
            "font-medium transition-all duration-200 " +
            `${disabled ? "opacity-35 cursor-not-allowed grayscale-[0.5]" : "active:scale-95 cursor-pointer"}`,
    );

    const variants = {
        navBar: "bg-neutral-700 enabled:hover:bg-neutral-600 text-neutral-200 border border-neutral-600 enabled:hover:border-neutral-500",
        ai: "bg-gradient-to-r from-violet-800/50 to-indigo-800/50 enabled:hover:from-violet-700/60 enabled:hover:to-indigo-700/60 text-violet-100 border border-violet-600/40",
    };
</script>

<button class="{baseClass} {variants[variant]}" {onclick} {disabled}>
    {#if icon}
        <img src={icon} alt="" class="h-4 w-4 opacity-80" />
    {/if}
    <span>{text}</span>
</button>
