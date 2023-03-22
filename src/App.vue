<script setup lang="ts">
import ChatInterface from "./components/ChatInterface.vue";
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-screen">
    <ChatInterface />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
