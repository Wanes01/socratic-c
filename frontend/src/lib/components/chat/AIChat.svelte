<script lang="ts">
    import { cs } from "../../state/ChatState.svelte";
    import { fs } from "../../state/FileState.svelte";
    import { marked } from "marked";
    import Button from "../ui/Button.svelte";

    let messageContent = $state("");
    let messagesContainer = $state<HTMLDivElement | null>(null);
    let textareaElement = $state<HTMLTextAreaElement | null>(null);

    // autoscrolls when messages are added to the chat
    $effect(() => {
        if (!cs.isGenerating) return;

        const interval = setInterval(() => {
            messagesContainer?.scrollTo({
                top: messagesContainer.scrollHeight,
            });
        }, 50);

        return () => clearInterval(interval);
    });

    // resizes the text area on user input
    const autoResize = (e: Event): void => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = target.scrollHeight + "px";
    };

    // sends a message to che LLM, if possible
    const sendMessage = async (): Promise<void> => {
        if (cs.isGenerating) {
            return;
        }
        await fs.saveCurrentExerciseFiles();
        const tmpMsg = messageContent;
        messageContent = "";
        if (textareaElement) {
            textareaElement.style.height = "auto";
        }

        await cs.send(tmpMsg);
    };
</script>

<div class="h-full flex flex-col overflow-hidden">
    {#if cs.isServiceAvailable}
        <div
            bind:this={messagesContainer}
            class="flex-1 overflow-y-auto p-4 markdown"
        >
            {#each cs.messages as message, i (i)}
                {#if message.role === "assistant"}
                    <div class="mb-3">
                        <!-- assistant messages, translated from markdown to html -->
                        {@html marked(message.content)}
                    </div>
                {:else}
                    <div class="flex justify-end mb-3">
                        <p
                            class="bg-neutral-700 text-gray-300 text-sm px-3 py-2 rounded-sm max-w-[80%] border border-neutral-600 leading-relaxed"
                        >
                            {message.content}
                        </p>
                    </div>
                {/if}
            {/each}
            {#if cs.isGenerating}
                <p class="italic text-purple-400/70">
                    Sto generando la risposta{cs.messages.length === 2
                        ? ", il primo messaggio potrebbe impiegare più tempo del solito"
                        : ""}...
                </p>
            {/if}
        </div>

        <!-- input -->
        <div
            class="flex flex-row gap-2 p-2 border-t border-white/10 bg-neutral-900"
        >
            <textarea
                bind:this={textareaElement}
                bind:value={messageContent}
                placeholder="Scrivi un messaggio..."
                rows="1"
                class="flex-1 resize-none bg-neutral-800 text-gray-300 text-sm placeholder-neutral-500 border border-neutral-700 rounded-sm px-3 py-2
            focus:outline-none focus:border-violet-600/60 transition-colors duration-200 max-h-150
            disabled:opacity-40 disabled:cursor-not-allowed"
                oninput={autoResize}
                onkeydown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                disabled={!fs.selectedExercise}
            ></textarea>
            <Button
                text="invia messaggio"
                icon="bot.svg"
                variant="ai"
                iconOnly={true}
                disabled={cs.isGenerating || !fs.selectedExercise}
                onclick={sendMessage}
            />
        </div>
        <!-- Service is not available and the user can't use the chat -->
    {:else}
        <div class="flex flex-col items-center justify-center h-full">
            <p class="text-neutral-500 italic">Nessun modello configurato</p>
            <p class="text-neutral-600 mt-1">Controlla il file .env o Ollama</p>
        </div>
    {/if}
</div>
