<script lang="ts">
    import { cs } from "../../state/ChatState.svelte";
    import { marked } from "marked";
    import { markedHighlight } from "marked-highlight";
    import hljs from "highlight.js";
    import "highlight.js/styles/atom-one-dark.css";
    import Button from "../ui/Button.svelte";
    import { fs } from "../../state/FileState.svelte";

    let messageContent = $state("");
    let messagesContainer = $state<HTMLDivElement | null>(null);

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

    // sets the highlighting for code blocks
    marked.use(
        markedHighlight({
            langPrefix: "hljs language-",
            highlight(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
        }),
    );

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
        const tmpMsg = messageContent;
        messageContent = "";
        await cs.send(tmpMsg);
    };
</script>

<div class="h-full flex flex-col overflow-hidden">
    <div
        bind:this={messagesContainer}
        class="flex-1 overflow-y-auto p-4 ai-message"
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
</div>

<style>
    /* marked converts markdown into HTML tags.
    Since marked cannot generate Tailwind classes to associate with the tags,
    all styling for the LLM's responses is written as CSS. */

    /* ai message wrapper */
    :global(.ai-message) {
        font-family: "Inter", sans-serif;
        font-size: 0.875rem;
        line-height: 1.6;
        color: #d1d5db; /* gray-300 */
    }

    /* headings */
    :global(.ai-message h1) {
        font-size: 1.1rem;
        font-weight: 700;
        color: #e5e5e5;
        margin: 1rem 0 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 0.25rem;
    }
    :global(.ai-message h2) {
        font-size: 1rem;
        font-weight: 600;
        color: #e5e5e5;
        margin: 0.875rem 0 0.4rem 0;
    }
    :global(.ai-message h3) {
        font-size: 0.875rem;
        font-weight: 600;
        color: #d4d4d4;
        margin: 0.75rem 0 0.35rem 0;
    }

    /* paragraphs */
    :global(.ai-message p) {
        margin: 0.4rem 0;
    }

    /* inline code */
    :global(.ai-message code) {
        font-family: "JetBrains Mono", "Courier New", monospace;
        font-size: 0.8rem;
        background-color: #171717; /* neutral-900 in tailwind */
        color: #c084fc; /* purple-400 in tailwind */
        padding: 1px 5px;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* code blocks */
    :global(.ai-message pre) {
        background-color: #171717;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        padding: 0.75rem 1rem;
        overflow-x: auto;
        margin: 0.6rem 0;
    }
    :global(.ai-message pre code) {
        background: none;
        border: none;
        padding: 0;
        color: #d4d4d4;
        font-size: 0.8rem;
    }

    /* lists */
    :global(.ai-message ul),
    :global(.ai-message ol) {
        padding-left: 1.25rem;
        margin: 0.4rem 0;
    }
    :global(.ai-message li) {
        margin: 0.2rem 0;
    }
    :global(.ai-message ul li) {
        list-style-type: disc;
    }
    :global(.ai-message ol li) {
        list-style-type: decimal;
    }

    /* blockquotes */
    :global(.ai-message blockquote) {
        border-left: 2px solid #7c3aed; /* violet-700 */
        background-color: rgba(109, 40, 217, 0.08);
        margin: 0.6rem 0;
        padding: 0.5rem 0.75rem;
        border-radius: 0 4px 4px 0;
        color: #c4b5fd; /* violet-300 */
        font-style: italic;
    }

    /* bold and italic */
    :global(.ai-message strong) {
        color: #e5e5e5;
        font-weight: 600;
    }
    :global(.ai-message em) {
        color: #a3a3a3; /* neutral-400 */
    }

    /* separator */
    :global(.ai-message hr) {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        margin: 0.75rem 0;
    }

    /* tables */
    :global(.ai-message table) {
        width: 100%;
        border-collapse: collapse;
        margin: 0.6rem 0;
        font-size: 0.8rem;
    }

    :global(.ai-message thead tr) {
        background-color: #171717;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    :global(.ai-message th) {
        text-align: left;
        padding: 0.4rem 0.75rem;
        font-weight: 600;
    }

    :global(.ai-message td) {
        padding: 0.4rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #d1d5db;
    }

    :global(.ai-message tbody tr:hover) {
        background-color: rgba(255, 255, 255, 0.03);
    }
</style>
