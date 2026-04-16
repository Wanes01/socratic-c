<script lang="ts">
    import { cs } from "../../state/ChatState.svelte";
    import AnsiToHtml from "ansi-to-html";
    import stripAnsi from "strip-ansi";
    import {
        ts,
        EXEC_MAX_OUTPUT_CHARS,
        MESSAGES,
    } from "../../state/TerminalState.svelte";
    import Button from "../ui/Button.svelte";
    import { slide, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";

    const convert = new AnsiToHtml();
    let scrollContainer: HTMLDivElement | null = $state(null);
    // the formatted terminal output
    let htmlOutput = $derived(convert.toHtml(ts.output));
    // terminal output as plain text
    let plainTextOutput = $derived(stripAnsi(ts.output));

    // every time the output changes the terminal autoscrolls
    $effect(() => {
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }

        /* if the output exeedes the max amount of characters, kills
        the process in order to not saturare memory*/
        if (ts.isExecuting && plainTextOutput.length > EXEC_MAX_OUTPUT_CHARS) {
            ts.stop();
            ts.output += MESSAGES.MAX_OUTPUT_EXEEDED;
        }
    });

    const sendInputClick = () => {
        ts.sendInput();
    };

    const sendInputKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && ts.isExecuting) {
            ts.sendInput();
        }
    };

    const aiHelpClick = async () => {
        if (cs.isGenerating) {
            return;
        }

        // the flags used to compile, as a string
        const flags = Object.entries(ts.compileOptions)
            .filter(([_, value]) => value)
            .map(([key]) => {
                if (key.startsWith("w")) {
                    return `-W${key.slice(1)}`;
                }
                return key !== "includeTests" ? `-${key}` : "";
            })
            .join(" ");

        await cs.send(
            `Ho riscontrato un problema con il mio codice C. La compilazione è stata eseguita con questi flag: "${flags}". L'output sul terminale è "${plainTextOutput}". Analizza l'output del terminale qui sopra. Identifica se si tratta di un errore di compilazione, un warning o un errore a runtime. Spiega in modo semplice cosa sta cercando di dirmi il compilatore o il sistema e dammi un suggerimento su come proseguire.`,
        );
    };
</script>

<div class="flex flex-col w-full h-full bg-neutral-950 font-mono">
    <div
        class="flex items-center justify-between px-3 pb-1 pt-2 bg-neutral-900 border-b border-white/5 select-none"
    >
        <span
            class="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >Output del programma</span
        >
        {#if ts.hasErrors || ts.hasWarnings}
            <div transition:scale={{ duration: 200, easing: cubicOut }}>
                <Button
                    text="Chiedi un suggerimento all'IA"
                    icon="bot.svg"
                    variant="ai"
                    overrideClass="font-sans py-1"
                    onclick={aiHelpClick}
                />
            </div>
        {/if}
    </div>

    <div
        bind:this={scrollContainer}
        class="flex-1 overflow-y-auto p-3 text-sm leading-relaxed custom-scrollbar scroll-smooth"
    >
        <p class="text-gray-300 whitespace-pre-wrap break-all">
            {@html htmlOutput}
        </p>
    </div>

    <div
        class="flex flex-row items-center border-t border-white/5 bg-neutral-900"
    >
        <div class="flex flex-row px-3 flex-1 items-center">
            <span class="text-violet-400 font-bold mr-2">&gt;</span>
            <input
                type="text"
                bind:value={ts.params}
                placeholder={ts.isExecuting
                    ? "Inserisci input per il programma..."
                    : "Argomenti linea di comando..."}
                class="w-full py-2 bg-transparent text-gray-200 text-sm outline-none placeholder:text-neutral-600"
                onkeydown={sendInputKeyDown}
            />
        </div>
        {#if ts.isExecuting}
            <div transition:slide={{ axis: "x", duration: 250 }}>
                <Button
                    text="Invia"
                    rounded={false}
                    overrideClass="h-full px-6"
                    onclick={sendInputClick}
                />
            </div>
        {/if}
    </div>
</div>
