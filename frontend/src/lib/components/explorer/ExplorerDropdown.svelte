<script lang="ts">
    import type { Snippet } from "svelte";
    import { slide } from "svelte/transition";
    import { untrack } from "svelte";

    interface Props {
        title: string;
        openOnMount?: boolean;
        disabled?: boolean;
        children: Snippet;
    }

    let {
        title,
        disabled = false,
        openOnMount = false,
        children,
    }: Props = $props();

    let isOpen = $state(untrack(() => openOnMount));
</script>

<div class="flex flex-col w-full py-2">
    <button
        type="button"
        class="flex items-center gap-4 px-4 mb-2 cursor-pointer disabled:cursor-not-allowed text-neutral-300 disabled:text-neutral-400/40"
        onclick={() => {
            if (!disabled) {
                isOpen = !isOpen;
            }
        }}
        {disabled}
    >
        <p class="tracking-widest text-[0.75rem] text-left font-bold uppercase">
            {title}
        </p>
        <svg
            class="h-3 w-3 opacity-60 transition-transform duration-200 group-hover:opacity-100 {isOpen
                ? 'rotate-180'
                : ''}"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    </button>

    {#if isOpen}
        <div transition:slide={{ duration: 200 }}>
            {@render children?.()}
        </div>
    {/if}
</div>
