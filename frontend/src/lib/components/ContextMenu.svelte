<script lang="ts">
    let { x, y, options, onclose } = $props();

    // closes the menu if the user clicks outside of the context menu
    $effect(() => {
        const handleOutsideClick = () => onclose();
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    });

    // closes the menu if the user clicks esc
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onclose();
    };
</script>

<div
    class="fixed z-50 bg-neutral-800 border border-neutral-700 shadow-xl rounded-md py-1 min-w-40 text-sm text-neutral-200"
    style="top: {y}px; left: {x}px;"
    role="menu"
    tabindex="-1"
    onkeydown={handleKeyDown}
    onclick={(e) => e.stopPropagation()}
>
    {#each options as option}
        <button
            role="menuitem"
            class="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
            onclick={() => {
                option.action();
                onclose();
            }}
        >
            <span>{option.icon}</span>
            {option.label}
        </button>
    {/each}
</div>
