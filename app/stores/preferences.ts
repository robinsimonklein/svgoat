export const usePreferencesStore = defineStore('preferences', () => {
  const colorMode = useColorMode();

  const preferences = useLocalStorage(
    'preferences',
    {
      enableSimulatedCurrentColor: false,
      simulatedCurrentColor: '#000',
      prettify: false,
      showGzipped: false,
      cleanFilenames: false,
    },
    {
      mergeDefaults: true,
    },
  );

  const simulatedCurrentColor = computed(() => {
    if (preferences.value.enableSimulatedCurrentColor) return preferences.value.simulatedCurrentColor;

    return colorMode.value === 'dark' ? '#FFF' : '#000';
  });
  const debouncedSimulatedCurrentColor = refDebounced(simulatedCurrentColor, 100);

  return { preferences, debouncedSimulatedCurrentColor };
});
