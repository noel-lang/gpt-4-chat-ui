import { Ref, ref } from "vue";
import { ChatCompletionRequestMessage, CreateChatCompletionRequest } from "openai";
import config from "../config";

const utf8Decoder = new TextDecoder("utf-8");

const decodeResponse = (response?: Uint8Array) => {
    if (!response) {
        return "";
    }

    const pattern = /"delta":\s*({.*?"content":\s*".*?"})/g;
    const matches: string[] = [];
    const decodedText = utf8Decoder.decode(response);

    let match;

    while ((match = pattern.exec(decodedText)) !== null) {
        matches.push(JSON.parse(match[1]).content);
    }

    return matches.join("");
}

export default function useChatAssistant() {
    const messages: Ref<ChatCompletionRequestMessage[]> = ref([] as ChatCompletionRequestMessage[]);

    function onText(text: string) {
        const lastMessage = messages.value[messages.value.length - 1];

        if (lastMessage.role === "user") {
            return messages.value.push({
                role: "assistant",
                content: text
            });
        }

        lastMessage.content = text;
    }

    async function readStreamContent(reader: ReadableStreamDefaultReader<Uint8Array>, currentText = "") {
        const { value, done } = await reader.read();

        if (done) {
            onText(currentText);
            return;
        }

        const delta = decodeResponse(value);

        if (delta) {
            currentText += delta;
            onText(currentText.trim());
        }

        await readStreamContent(reader, currentText);
    }

    async function chat(content: string): Promise<void> {
        const abortController = new AbortController();
        const newMessage: ChatCompletionRequestMessage = {
            role: "user",
            content: content
        };

        messages.value.push(newMessage);

        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.API_KEY}`,
            },
            method: "POST",
            body: JSON.stringify({
                model: "gpt-4",
                messages: messages.value,
                stream: true,
            } as CreateChatCompletionRequest),
            signal: abortController.signal
        });

        if (res.body == null) {
            throw new Error();
        }

        const reader = res.body.getReader();
        await readStreamContent(reader);
    }

    return { messages, chat };
}
