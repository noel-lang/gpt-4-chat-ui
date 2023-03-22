<template>
  <div class="flex flex-col flex-auto flex-shrink-0 bg-gray-100 h-full px-6 pb-3 rounded-lg">
    <!-- Chat Messages -->
    <div class="grid grid-cols-12 h-full overflow-y-scroll py-6">
      <div class="col-start-1 col-end-8 space-y-4">
        <ChatMessage v-for="message in messages" :content="message.content" :role="message.role"/>
      </div>
    </div>

    <!-- Input -->
    <form @submit.prevent="handleSubmit" class="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4 gap-4">
      <input v-model="message" type="text"
             class="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"/>
      <button
        class="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0">
        <span>Send</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import useChatAssistant from "../composables/useChatAssistant";
import ChatMessage from "./ChatMessage.vue";

const { messages, chat } = useChatAssistant();
const message = ref("");

function handleSubmit() {
  chat(message.value);
  message.value = "";
}
</script>
