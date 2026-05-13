import { optimize } from 'svgo/browser';

export const useStore = defineStore('main', () => {
  const settingsStore = useSettingsStore();
  const preferencesStore = usePreferencesStore();
  const figmaStore = useFigmaStore();
  const toast = useToast();

  const inputs = ref<SvgInput[]>([]);

  const mode = computed<'empty' | 'figma' | 'single' | 'batch'>(() => {
    if (figmaStore.state.step !== 'form') return 'figma';
    if (!inputs.value?.length) return 'empty';
    return inputs.value.length > 1 ? 'batch' : 'single';
  });

  const optimizedItems = computed<OptimizedSvg[]>(() => {
    const prettify = preferencesStore.preferences.prettify;
    const config = prettify
      ? { ...settingsStore.svgoConfig, js2svg: { pretty: true, indent: 2 } }
      : settingsStore.svgoConfig;

    return inputs.value.map(input => {
      try {
        const { data } = optimize(input.text, config);
        return {
          id: input.id,
          text: data,
          width: input.width,
          height: input.height,
          rawSize: new Blob([input.text]).size,
          optimizedSize: new Blob([data]).size,
        };
      } catch {
        return { id: input.id, text: '', width: 0, height: 0, rawSize: 0, optimizedSize: 0 };
      }
    });
  });

  // Backward-compatible single-item accessors
  const input = computed(() => inputs.value[0] ?? null);
  const rawSvg = computed(() => input.value?.text ?? null);
  const optimizedSvg = computed(() => optimizedItems.value[0]?.text ?? null);

  const displayFilenames = computed(() =>
    inputs.value.map(input => {
      if (!input.filename) return undefined;
      return preferencesStore.preferences.cleanFilenames ? cleanFilename(input.filename) : input.filename;
    }),
  );
  const displayFilename = computed(() => displayFilenames.value[0]);

  const batchStats = computed(() => {
    const items = optimizedItems.value;
    return {
      count: items.length,
      totalRawSize: items.reduce((sum, i) => sum + i.rawSize, 0),
      totalOptimizedSize: items.reduce((sum, i) => sum + i.optimizedSize, 0),
    };
  });

  const setInputs = (newInputs: SvgInput[]) => {
    if (!newInputs.length) return;
    inputs.value = newInputs;
  };

  const addFromText = (raw: string) => {
    const parsed = extractSvgs(raw);
    setInputs(parsed.map(p => createInput(p, { type: 'clipboard' })));
  };

  const addFromFiles = async (files: File[]) => {
    const svgFiles = files.filter(f => f.type === 'image/svg+xml');
    if (!svgFiles.length) return;

    const results = await Promise.allSettled(
      svgFiles.map(async f => createInput(parseSvg(await f.text()), { type: 'filesystem' }, f.name)),
    );

    const successes: SvgInput[] = [];
    const failures: { name: string; reason: string }[] = [];
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') successes.push(r.value);
      else failures.push({ name: svgFiles[i]!.name, reason: (r.reason as Error).message });
    });

    if (!successes.length) {
      if (failures.length === 1) throw new Error(failures[0]!.reason);
      throw new Error(`None of the ${failures.length} files could be parsed.`);
    }

    if (failures.length) {
      toast.add({
        title: failures.length === 1 ? '1 file was skipped' : `${failures.length} files were skipped`,
        description:
          failures.length === 1
            ? `${failures[0]!.name}: ${failures[0]!.reason}`
            : `${failures.length} of ${svgFiles.length} files could not be parsed.`,
        color: 'warning',
      });
    }

    setInputs(successes);
  };

  const removeInput = (index: number) => {
    inputs.value.splice(index, 1);
  };

  const clearInputs = () => {
    inputs.value = [];
  };

  return {
    inputs,
    input,
    mode,
    rawSvg,
    optimizedSvg,
    optimizedItems,
    displayFilenames,
    displayFilename,
    batchStats,
    setInputs,
    addFromText,
    addFromFiles,
    removeInput,
    clearInputs,
  };
});
