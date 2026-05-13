export default defineEventHandler(event => {
  deleteCookie(event, 'figma_access_token');
  deleteCookie(event, 'figma_refresh_token');
  deleteCookie(event, 'figma_connected');

  return { success: true };
});
