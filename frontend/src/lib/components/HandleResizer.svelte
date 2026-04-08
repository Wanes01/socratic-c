<script lang="ts">
    import { PaneResizer } from "paneforge";

    type Direction = "horizontal" | "vertical";

    type Props = {
        direction: Direction;
    };

    let { direction }: Props = $props();
</script>

<PaneResizer
    class="{direction == 'vertical'
        ? 'w-1.5 flex-col h-full'
        : 'h-1.5 flex-row w-full'} relative bg-neutral-700 hover:bg-blue-500 transition-colors
        flex justify-center items-center"
>
    <!-- handle -->
    <div
        class="{direction == 'vertical'
            ? 'h-12 w-0.75'
            : 'h-0.75 w-12'} rounded-full bg-neutral-300"
    ></div>
</PaneResizer>
