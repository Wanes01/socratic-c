<script lang="ts">
    interface Props {
        text: string;
        icon?: string;
    }

    let { text, icon }: Props = $props();
</script>

<button
    class="px-2 py-1.5 rounded-lg cursor-pointer bg-purple-300 hover:bg-purple-400 active:scale-95 active:translate-y-px
         transition-all duration-150 flex flex-row items-center gap-2 text-neutral-800"
>
    {#if icon}
        <img src={icon} alt={text} class="h-4.5" />
    {/if}
    <p>{text}</p>
</button>
