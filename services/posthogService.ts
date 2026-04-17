import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || 'phc_placeholder';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const initPostHog = () => {
  try {
    if (typeof window !== 'undefined' && POSTHOG_KEY !== 'phc_placeholder') {
      posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          autocapture: true,
          capture_pageview: true,
          persistence: 'localStorage'
      });
    }
  } catch (err) {
    console.warn("PostHog initialization failed:", err);
  }
};

export const trackPH = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
};

export default posthog;
