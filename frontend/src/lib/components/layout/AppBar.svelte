<script lang="ts">
    import { fs } from "../../state/FileState.svelte";
    import { ts } from "../../state/TerminalState.svelte";
    import Button from "../ui/Button.svelte";
    import CompileSettings from "../dropdowns/CompileSettings.svelte";

    const compileClick = async () => {
        if (fs.selectedExercise !== null) {
            // saves all the open files before compiling
            for (const file of fs.openedFiles) {
                await fs.saveFile(file);
            }
            await ts.compile(fs.selectedExercise);
        }
    };
</script>

<div
    class="flex flex-row px-4 py-2 justify-between items-center bg-neutral-900 border-b border-neutral-800 select-none"
>
    <div class="flex flex-row gap-10">
        <div class="flex items-center gap-2">
            <p class="font-mono font-black text-xl tracking-tighter text-white">
                socrati<span class="text-purple-400">c_c</span>
            </p>
        </div>
        <CompileSettings />
    </div>

    <div class="flex flex-row gap-2">
        <Button
            text="Compila"
            icon="compile.svg"
            variant="navBar"
            disabled={fs.selectedExercise === null || ts.isCompiling}
            onclick={compileClick}
        />

        <Button
            text="Esegui"
            icon="run.svg"
            variant="navBar"
            disabled={!ts.canExecute}
            onclick={() => console.log("esegui")}
        />

        <!-- separator -->
        <div class="w-px h-6 bg-neutral-800 mx-1 self-center"></div>
        <Button text="Chiedi all'IA" icon="bot.svg" variant="ai" />
    </div>
</div>
