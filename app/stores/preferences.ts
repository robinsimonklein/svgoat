export const usePreferencesStore = defineStore('preferences', () => {
  const colorMode = useColorMode();

  const preferences = useLocalStorage(
    'preferences',
    {
      enableSimulatedCurrentColor: false,
      simulatedCurrentColor: '#000',
      showGzipped: false,
      cleanFilenames: false,
    },
    {
      mergeDefaults: true,
    },
  );

  watch(
    () => preferences.value.enableSimulatedCurrentColor,
    value => trackEvent('preference_toggled', { key: 'enableSimulatedCurrentColor', value }),
  );
  watch(
    () => preferences.value.showGzipped,
    value => trackEvent('preference_toggled', { key: 'showGzipped', value }),
  );
  watch(
    () => preferences.value.cleanFilenames,
    value => trackEvent('preference_toggled', { key: 'cleanFilenames', value }),
  );

  const simulatedCurrentColor = computed(() => {
    if (preferences.value.enableSimulatedCurrentColor) return preferences.value.simulatedCurrentColor;

    return colorMode.value === 'dark' ? '#FFF' : '#000';
  });
  const debouncedSimulatedCurrentColor = refDebounced(simulatedCurrentColor, 100);

  return { preferences, debouncedSimulatedCurrentColor };
});
