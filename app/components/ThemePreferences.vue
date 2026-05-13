<template>
  <div class="min-w-60 space-y-5 p-4">
    <UColorModeSelect :ui="{ base: 'w-full' }" />
    <div>
      <USwitch v-model="preferencesStore.preferences.enableSimulatedCurrentColor" label="Simulate currentColor">
      </USwitch>

      <div v-if="preferencesStore.preferences.enableSimulatedCurrentColor" class="mt-2">
        <UColorPicker v-model="preferencesStore.preferences.simulatedCurrentColor" size="lg" />
        <!--        <UInput-->
        <!--          v-model="preferencesStore.preferences.simulatedCurrentColor"-->
        <!--          type="text"-->
        <!--          class="mt-2"-->
        <!--          :ui="{ root: 'w-full' }"-->
        <!--        />-->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const preferencesStore = usePreferencesStore();
</script>
