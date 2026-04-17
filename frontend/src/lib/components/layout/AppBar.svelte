<script lang="ts">
    import { fs } from "../../state/files-state.svelte";
    import { ts } from "../../state/terminal-state.svelte";
    import { cs } from "../../state/chat-state.svelte";
    import { ui } from "../../state/ui-state.svelte";
    import Button from "../ui/Button.svelte";
    import CompileSettings from "../dropdowns/CompileSettings.svelte";
    import ProviderSelector from "../dropdowns/ProviderSelector.svelte";

    const compileClick = async () => {
        if (fs.selectedExercise === null) {
            return;
        }
        // stops the execution of the current process
        if (ts.isExecuting) {
            ts.stop();
        }
        // saves all the exercise files before compiling
        await fs.saveCurrentExerciseFiles();
        await ts.compile(fs.selectedExercise);
    };

    const executeClick = () => {
        if (fs.selectedExercise !== null) {
            ts.execute(fs.selectedExercise);
        }
    };

    const stopClick = () => {
        ts.stop();
    };

    const saveClick = async () => {
        await fs.saveAllFiles();
        ui.showToast("File salvati", "info", 1000);
    };

    const aiAdviceClick = async () => {
        if (cs.isGenerating || !fs.selectedExercise) {
            return;
        }
        // saves all the current exercises files, so that the ai can take them into consideration
        await fs.saveCurrentExerciseFiles();
        await cs.send(
            "L'esercizio è stato completato con successo? Se non è così, dammi un suggerimento su come proseguire.",
        );
    };
</script>

<div
    class="flex flex-row px-4 py-2 justify-between items-center bg-neutral-900 border-b border-neutral-800 select-none"
>
    <div class="flex flex-row gap-10">
        <p class="font-mono font-black text-xl tracking-tighter text-white">
            socrati<span class="text-purple-400">c_c</span>
        </p>
        <Button
            text="Salva tutti i file"
            icon="save.svg"
            variant="navBar"
            disabled={fs.openedFiles.length === 0}
            onclick={saveClick}
        />
    </div>

    <div class="flex flex-row gap-2">
        <ProviderSelector />
        <CompileSettings />
        <Button
            text="Compila"
            icon="compile.svg"
            variant="navBar"
            disabled={fs.selectedExercise === null || ts.isCompiling}
            onclick={compileClick}
        />

        {#if !ts.isExecuting}
            <Button
                text="Esegui"
                icon="run.svg"
                variant="navBar"
                disabled={!ts.canExecute}
                onclick={executeClick}
            />
        {:else}
            <Button
                text="Ferma"
                icon="stop.svg"
                variant="navBar"
                onclick={stopClick}
            />
        {/if}

        <!-- separator -->
        <div class="w-px h-6 bg-neutral-800 mx-1 self-center"></div>
        <Button
            text="Chiedi all'IA"
            icon="bot.svg"
            variant="ai"
            disabled={cs.isGenerating || !fs.selectedExercise}
            onclick={aiAdviceClick}
        />
    </div>
</div>
