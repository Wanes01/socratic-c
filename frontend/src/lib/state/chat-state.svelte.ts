import type { ChatMessage, ChatRole, LLMOption } from "../types"
import { streamChat, fetchModels } from "../services/chat-api";
import { fs } from "./files-state.svelte";

/* maximum number of messages retained in the conversation context
to optimize the tokens sent to the LLM model. */
export const MAX_CONTEXT_MESSAGES = 15;

class ChatState {
    LOCAL_PROVIDER = 'ollama';
    models = $state<LLMOption[]>([]);
    selectedProvider = $state<string>("");
    isServiceAvailable = $derived(this.models.some(opt => opt.available));
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
            for await (const token of streamChat(this.LLMContext, fs.selectedExercise, this.selectedProvider)) {
                this.appendToLastMessage(token);
            }
        } catch (err) {
            console.error("ChatState.send error:", err);
            this.appendToLastMessage("\n\n-- Errore durante la generazione della risposta --");
        } finally {
            this.isGenerating = false;
        }
    };

    // cleans chat history
    cleanChat = (): void => {
        this.messages = [];
    }

    // fetches the available language models
    refreshAvailableModels = async (): Promise<void> => {
        const result = await fetchModels() as { success: boolean, models: LLMOption[] };
        if (result.success) {
            this.models = result.models;
        }

        // something went wrong and no model is available
        if (this.models.length === 0) {
            return;
        }
    }

    // sets the default provider. To be used on app startup.
    setDefaultProvider = () => {
        // selects a cloud model by default, if present
        this.selectedProvider =
            this.models.find(opt => opt.provider !== this.LOCAL_PROVIDER && opt.available)?.provider || "";

        if (this.selectedProvider) {
            return;
        }

        // tries to use the local, if available
        this.selectedProvider = this.models.find(opt => opt.provider === this.LOCAL_PROVIDER && opt.available)?.provider || ""
    }
}

export const cs = new ChatState();