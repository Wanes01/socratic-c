<script lang="ts">
    import type { Snippet } from "svelte";
    type Props = {
        title: String;
        children?: Snippet;
    };
    let { title, children }: Props = $props();
</script>

<div class="flex flex-col w-full py-2">
    <p
        class="tracking-widest text-neutral-300 ml-4 mb-2 text-[0.75rem] font-bold uppercase"
    >
        {title}
    </p>
    {@render children?.()}
</div>
