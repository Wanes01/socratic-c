<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        iconSrc: string;
        altText?: string;
        children: Snippet;
        position?: "top" | "bottom" | "left" | "right";
    }

    let {
        iconSrc,
        altText = "Informazione",
        children,
        position = "top",
    }: Props = $props();

    let anchor = $state<HTMLElement | null>(null);
    let visible = $state(false);
    let coords = $state({ top: 0, left: 0, transform: "" });

    const gap = 8;

    // computes the box coordinates on the page. This is done to avoid the content box being cut.
    function calcCoords() {
        if (!anchor) return;
        const rect = anchor.getBoundingClientRect();
        switch (position) {
            case "top":
                coords = {
                    top: rect.top - gap,
                    left: rect.left + rect.width / 2,
                    transform: "translate(-50%, -100%)",
                };
                break;
            case "bottom":
                coords = {
                    top: rect.bottom + gap,
                    left: rect.left + rect.width / 2,
                    transform: "translateX(-50%)",
                };
                break;
            case "left":
                coords = {
                    top: rect.top + rect.height / 2,
                    left: rect.left - gap,
                    transform: "translate(-100%, -50%)",
                };
                break;
            case "right":
                coords = {
                    top: rect.top + rect.height / 2,
                    left: rect.right + gap,
                    transform: "translateY(-50%)",
                };
                break;
        }
    }

    function show() {
        calcCoords();
        visible = true;
    }
    function hide() {
        visible = false;
    }
</script>

<div
    bind:this={anchor}
    class="flex items-center justify-center w-max cursor-help"
    onmouseenter={show}
    role="contentinfo"
    onmouseleave={hide}
>
    <img
        src={iconSrc}
        alt={altText}
        class="w-4 h-4 object-contain transition-opacity duration-200"
        class:opacity-60={!visible}
        class:opacity-100={visible}
    />
</div>

{#if visible}
    <div
        style="position: fixed; top: {coords.top}px; left: {coords.left}px; transform: {coords.transform}; z-index: 9999;"
        class="pointer-events-none
               bg-neutral-800 border border-neutral-700 rounded-sm shadow-xl
               w-max max-w-62.5 py-2 px-3
               text-neutral-200 text-[0.75rem] leading-relaxed font-medium"
    >
        {@render children()}
    </div>
{/if}
