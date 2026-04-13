import type { ChatMessage } from "../types"

/* maximum number of messages retained in the conversation context
to optimize the tokens sent to the LLM model. */
export const MAX_CONTEXT_MESSAGES = 10;

class ChatState {
    messages = $state<ChatMessage[]>([]);
    isGenerating = $state<boolean>(false); // true if the LLM is currently generating the answer
}

export const cs = new ChatState();