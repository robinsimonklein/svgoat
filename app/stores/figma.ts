type State =
  | { step: 'form' }
  | { step: 'inspect' }
  | { step: 'choice'; inspected: FigmaInspectedFile }
  | { step: 'extract' }
  | { step: 'import'; current: number; total: number };

export const useFigmaStore = defineStore('figma', () => {
  const store = useStore();
  const toast = useToast();

  const url = ref<string | undefined>(undefined);
  const state = ref<State>({ step: 'form' });

  const isLoading = computed(() => state.value.step === 'inspect');

  const getFetchErrorMessage = (e: unknown, fallback: string) => {
    // eslint-disable-next-line
    if (e && typeof e === 'object' && 'data' in e) return (e as any).data?.message || fallback;
    if (e instanceof Error) return e.message;
    return fallback;
  };

  const submit = async () => {
    if (!url.value?.length) return;

    return handleNewUrl(url.value);
  };

  const handleNewUrl = async (submittedUrl: string) => {
    if (isLoading.value) return;

    try {
      url.value = submittedUrl.trim();

      if (!isFigmaUrl(url.value)) return; // TODO: error ?

      state.value = { step: 'inspect' };

      const inspected = await $fetch<FigmaInspectedFile>('/api/figma/inspect', {
        query: { url: submittedUrl },
      });

      if (!inspected.node.children || inspected.node.children.length <= 1) {
        await importFromFigma(inspected.key, [inspected.node]);
        return;
      }

      state.value = { step: 'choice', inspected };
    } catch (e) {
      console.error(e);
      toast.add({
        title: 'Import failed',
        description: getFetchErrorMessage(e, 'Unable to inspect Figma file.'),
        color: 'error',
      });
      state.value = { step: 'form' };
    }
  };

  const importParent = () => {
    if (state.value.step !== 'choice') return;

    const { inspected } = state.value;

    return importFromFigma(inspected.key, [inspected.node]);
  };

  const importChildren = () => {
    if (state.value.step !== 'choice') return;

    const { inspected } = state.value;
    if (!inspected.node.children?.length) return;

    return importFromFigma(inspected.key, inspected.node.children);
  };

  const buildNodeUrl = (nodeId: string) => {
    if (!url.value) return url.value ?? '';
    const u = new URL(url.value);
    u.searchParams.set('node-id', nodeId);
    return u.toString();
  };

  const importFromFigma = async (key: string, nodes: FigmaNode[]) => {
    try {
      state.value = { step: 'extract' };

      const data = await $fetch<Record<string, string | null>>('/api/figma/extract', {
        query: {
          key,
          ids: nodes.map(item => item.id).join(','),
        },
      });

      if (!data.images) throw new Error('No images found.');

      const entries = Object.entries(data.images).filter(([_, url]) => !!url);
      state.value = { step: 'import', current: 0, total: entries.length };

      const items = await Promise.all(
        entries.map(([id, url]) =>
          $fetch<Blob>(url!).then(file => {
            if (state.value.step === 'import') state.value.current++;
            return { id, file };
          }),
        ),
      );

      const inputs: SvgInput[] = [];

      for (const item of items) {
        const parsed = parseSvg(await item.file.text());
        const node = nodes.find(n => n.id === item.id);
        const rawName = node?.name || item.id.replaceAll(':', '-');
        const filename = /\.svg$/i.test(rawName) ? rawName : `${rawName}.svg`;
        const source: SvgSource = {
          type: 'figma',
          fileUrl: url.value!,
          nodeUrl: buildNodeUrl(item.id),
          nodeId: item.id,
        };

        inputs.push(createInput(parsed, source, filename));
      }

      if (!inputs.length) throw new Error('No SVG found in the selected elements.');

      store.setInputs(inputs);
    } catch (e) {
      console.error(e);
      toast.add({
        title: 'Import failed',
        description: getFetchErrorMessage(e, 'Unable to extract SVGs from Figma.'),
        color: 'error',
      });
    } finally {
      reset();
    }
  };

  const reset = () => {
    state.value = { step: 'form' };
    url.value = undefined;
  };

  return { url, state, isLoading, submit, handleNewUrl, importFromFigma, importParent, importChildren, reset };
});
