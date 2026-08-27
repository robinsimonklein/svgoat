const ensureSvgExt = (name: string) => (/\.svg$/i.test(name) ? name : `${name}.svg`);

export const useSvgActions = () => {
  const { copy, copied, isSupported: isCopySupported } = useClipboard();

  const isDownloading = ref(false);

  const copySvg = async (svg: string) => {
    if (!svg.length) return;
    await copy(svg);
  };

  const downloadSvg = (svg: string, filename: string) => {
    if (!svg.length) return;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = ensureSvgExt(filename);
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async (items: { text: string }[], filenames: string[]) => {
    if (isDownloading.value || !items.length) return;

    try {
      isDownloading.value = true;

      const used = new Set<string>();
      const files = items.map((item, i) => {
        const base = ensureSvgExt(filenames[i] ?? `svg-${i + 1}`);
        let name = base;
        if (used.has(name)) {
          const dot = base.lastIndexOf('.');
          const stem = dot > 0 ? base.slice(0, dot) : base;
          const ext = dot > 0 ? base.slice(dot) : '';
          let n = 1;
          do {
            name = `${stem}-${n}${ext}`;
            n++;
          } while (used.has(name));
        }
        used.add(name);
        return { name, content: item.text };
      });

      const blob = await createZip(files);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized-svgs.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      isDownloading.value = false;
    }
  };

  return {
    copied,
    isCopySupported,
    isDownloading,
    copySvg,
    downloadSvg,
    downloadAllAsZip,
  };
};
