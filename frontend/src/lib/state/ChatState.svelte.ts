import type { ChatMessage, ChatRole } from "../types"
import { streamChat } from "../services/chat-api";
import { fs } from "./FileState.svelte";

/* maximum number of messages retained in the conversation context
to optimize the tokens sent to the LLM model. */
export const MAX_CONTEXT_MESSAGES = 10;

class ChatState {
    messages = $state<ChatMessage[]>([]); // all the messages between the student and the assistant
    LLMContext = $derived(this.messages.slice(-MAX_CONTEXT_MESSAGES)); // the messages that will be used in the context LLM context window
    isGenerating = $state<boolean>(false); // true if the LLM is currently generating the answer

    // adds a message to the current chat
    addMessage = (role: ChatRole, content: string): void => {
        this.messages.push({
            role,
            content
        });
    }

    /* appends a token to the last message in the chat, if
    the last message was from the assistant */
    appendToLastMessage = (token: string): void => {
        const last = this.messages[this.messages.length - 1];
        if (last && last.role === "assistant") {
            last.content += token;
        }
    }

    /* sends the user's new message along with the rest of the chat context
    to the LLM and constructs the response token by token */
    send = async (content: string): Promise<void> => {
        if (!content.trim() || this.isGenerating || fs.selectedExercise === null) {
            return;
        }

        this.addMessage("user", content);
        this.isGenerating = true;
        // starts with an empty message. It'll be filled with the token in the stream.
        this.addMessage("assistant", "");

        try {
            console.log('ok');
            for await (const token of streamChat(this.LLMContext, fs.selectedExercise)) {
                this.appendToLastMessage(token);
            }
        } catch (err) {
            console.error("ChatState.send error:", err);
            this.appendToLastMessage("\n\n-- Errore durante la generazione della risposta --");
        } finally {
            this.isGenerating = false;
        }
    };
}

export const cs = new ChatState();