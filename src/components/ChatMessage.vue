<template>
  <div class="flex flex-row items-baseline">
    <div class="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 text-white flex-shrink-0">
      {{ displayAvatar(role) }}
    </div>
    <div class="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl">
      <p>{{ content }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  role: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  }
});

function displayAvatar(text: string) {
  return text.substring(0, 1).toUpperCase();
}
</script>
