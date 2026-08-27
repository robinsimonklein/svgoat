export const trackEvent = (eventName: string, payload: Record<string, unknown> = {}) => {
  return useScriptUmamiAnalytics().proxy.track(eventName, payload);
};
