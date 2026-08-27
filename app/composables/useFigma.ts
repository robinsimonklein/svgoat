export const useFigma = () => {
  const isConnecting = useState('figma:connecting', () => false);

  const isConnected = useCookie('figma_connected', {
    decode: v => Boolean(Number(v)),
    encode: v => (v ? '1' : '0'),
    default: () => false,
  });

  async function connect() {
    try {
      isConnecting.value = true;
      const { url } = await $fetch<{ url: string }>('/api/figma/auth/connect');
      navigateTo(url, { external: true });
    } finally {
      isConnecting.value = false;
    }
  }

  async function disconnect() {
    await $fetch('/api/figma/auth/disconnect', { method: 'POST' });
  }

  return { isConnecting, isConnected, connect, disconnect };
};
