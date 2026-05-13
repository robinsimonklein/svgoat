export default defineEventHandler(async event => {
  const { figmaClientId, figmaRedirectUri } = useRuntimeConfig();

  const state = crypto.randomUUID();

  setCookie(event, 'figma_oauth_state', state, {
    httpOnly: true,
    secure: !import.meta.dev,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: figmaClientId,
    redirect_uri: figmaRedirectUri,
    scope: 'file_content:read',
    response_type: 'code',
    state,
  });

  return { url: `https://www.figma.com/oauth?${params}` };
});
