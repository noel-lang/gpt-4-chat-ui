import {Ref, ref} from "vue";
import {ChatCompletionRequestMessage, CreateChatCompletionRequest} from "openai";

const API_KEY = "<YOUR-API-KEY>";

const utf8Decoder = new TextDecoder("utf-8");

const decodeResponse = (response?: Uint8Array) => {
    // If the input 'response' is not provided, return an empty string.
    if (!response) {
        return "";
    }

    // Define a regular expression pattern that matches the 'delta' object containing 'content'.
    // The pattern looks for a JSON object with a 'delta' key, followed by the value, which is another
    // JSON object that includes a 'content' key with a string value.
    const pattern = /"delta":\s*({.*?"content":\s*".*?"})/g;
    const matches: string[] = [];


    const decodedText = utf8Decoder.decode(response);

    console.log(decodedText);

    let match;

    // Use a while loop to find all matches of the pattern in the decoded text.
    // The 'exec' method returns the next match in the string, or null if no more matches are found.
    while ((match = pattern.exec(decodedText)) !== null) {
        // For each match, parse the matched 'delta' object as JSON, and extract the 'content' value.
        // Then, push the 'content' value into the 'matches' array.
        matches.push(JSON.parse(match[1]).content);
    }

    // Join all the 'content' values in the 'matches' array into a single string and return it.
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
                Authorization: `Bearer ${API_KEY}`,
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
