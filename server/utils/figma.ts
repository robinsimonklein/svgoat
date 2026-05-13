import type { FetchOptions } from 'ofetch';
import type { H3Event } from 'h3';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

const refreshAccessToken = async (event: H3Event): Promise<string | null> => {
  const refreshToken = getCookie(event, 'figma_refresh_token');
  if (!refreshToken) return null;

  const { figmaClientId, figmaClientSecret } = useRuntimeConfig();

  try {
    const data = await $fetch<{ access_token: string; expires_in: number }>('https://api.figma.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${figmaClientId}:${figmaClientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    const secure = !import.meta.dev;

    setCookie(event, 'figma_access_token', data.access_token, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      expires: expiresAt,
    });

    setCookie(event, 'figma_connected', '1', {
      secure,
      sameSite: 'lax',
      expires: expiresAt,
    });

    return data.access_token;
  } catch {
    return null;
  }
};

export const useFigma = (event: H3Event) => {
  const fetch = async <T>(path: string, options?: FetchOptions): Promise<T> => {
    const accessToken = getCookie(event, 'figma_access_token');
    if (!accessToken) throw createError({ status: 401, message: 'Unauthorized' });

    try {
      return await $fetch<T>(`${FIGMA_API_BASE}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${accessToken}`, ...options?.headers },
      });
    } catch (error: unknown) {
      if ((error as { status?: number })?.status !== 401) throw error;

      const newToken = await refreshAccessToken(event);
      if (!newToken) throw createError({ status: 401, message: 'Unauthorized' });

      return await $fetch<T>(`${FIGMA_API_BASE}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${newToken}`, ...options?.headers },
      });
    }
  };

  return { fetch };
};
