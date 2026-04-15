<script lang="ts">
    import type { Snippet } from "svelte";
    type Props = {
        title: String;
        toolTip?: Snippet;
        children: Snippet;
    };
    let { title, toolTip, children }: Props = $props();
</script>

<div class="flex flex-col w-full py-2">
    <div class="flex flex-row gap-3 items-center">
        <p
            class="tracking-widest text-neutral-300 ml-4 mb-2 text-[0.75rem] font-bold uppercase"
        >
            {title}
        </p>
        {#if toolTip}
            <div class="mb-2">
                {@render toolTip?.()}
            </div>
        {/if}
    </div>
    {@render children?.()}
</div>
