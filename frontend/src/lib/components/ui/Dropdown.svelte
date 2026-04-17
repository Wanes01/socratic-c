<script lang="ts">
    let open = $state(false);
    let container = $state<HTMLElement>();

    interface Props {
        label: string;
        align?: "left" | "center" | "right";
        children?: import("svelte").Snippet;
    }

    let { label, children, align = "center" }: Props = $props();

    const alignClass = {
        left: "left-0",
        center: "left-1/2 -translate-x-1/2",
        right: "right-0",
    };

    function handleOutsideClick(e: MouseEvent) {
        if (container && !container.contains(e.target as Node)) {
            open = false;
        }
    }
</script>

<svelte:window onclick={handleOutsideClick} />

<div bind:this={container} class="relative">
    <button
        onclick={() => (open = !open)}
        class="dropdown-trigger flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-200 cursor-pointer"
    >
        <span>{label}</span>
        <svg
            class="h-3 w-3 opacity-60 transition-transform duration-200 {open
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
    {#if open}
        <div
            class="absolute top-full mt-1 z-50 min-w-48
                   bg-neutral-800 border border-neutral-700 rounded-sm shadow-lg
                   {alignClass[align]}"
        >
            {@render children?.()}
        </div>
    {/if}
</div>
