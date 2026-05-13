export default defineEventHandler(async event => {
  const accessToken = getCookie(event, 'figma_access_token');

  return { connected: !!accessToken };
});
