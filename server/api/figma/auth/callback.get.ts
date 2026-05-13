import { TokenRequestResult } from '@oslojs/oauth2';

export default defineEventHandler(async event => {
  const { figmaClientId, figmaClientSecret, figmaRedirectUri } = useRuntimeConfig();

  const { code, state } = getQuery(event);

  const storedState = getCookie(event, 'figma_oauth_state');
  deleteCookie(event, 'figma_oauth_state');

  if (!state || !storedState || state !== storedState) {
    throw createError({ statusCode: 403, message: 'Invalid OAuth state' });
  }

  const data = await $fetch('https://api.figma.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(figmaClientId + ':' + figmaClientSecret)}`,
    },
    body: new URLSearchParams({
      redirect_uri: figmaRedirectUri,
      code: String(code),
      grant_type: 'authorization_code',
    }),
  });

  if (typeof data !== 'object' || data === null) {
    throw createError('Unexpected response from Figma');
  }

  const result = new TokenRequestResult(data);

  if (result.hasErrorCode()) {
    const error = result.errorCode();
    throw createError(`Request failed: ${error}`);
  }

  const accessToken = result.accessToken();
  const accessTokenExpiresAt = result.accessTokenExpiresAt();
  const refreshToken = result.refreshToken();

  const secure = !import.meta.dev;

  setCookie(event, 'figma_access_token', accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    expires: accessTokenExpiresAt,
  });

  setCookie(event, 'figma_connected', '1', {
    secure,
    sameSite: 'lax',
    expires: accessTokenExpiresAt,
  });

  setCookie(event, 'figma_refresh_token', refreshToken ?? '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 120, // 4 months
  });

  return sendRedirect(event, '/');
});
