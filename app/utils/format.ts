export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatPercent = (rawSize: number, optimizedSize: number): string => {
  if (!rawSize) return '';
  const pct = ((1 - optimizedSize / rawSize) * 100).toFixed(1);
  return `-${pct}%`;
};
