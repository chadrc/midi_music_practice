<script setup lang="ts">
const props = defineProps<{
  label: string
}>();
</script>

<template>
  <div class="settings-edit-field">
    <span>{{ props.label }}:</span>
    <slot />
  </div>
</template>

<style scoped>
.settings-edit-field {
  display: flex;
  align-items: center;
}

.settings-edit-field > span {
  margin-right: 1rem;
}
</style>