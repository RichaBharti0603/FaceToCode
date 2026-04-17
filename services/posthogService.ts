import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.VITE_POSTHOG_KEY || 'phc_placeholder';
const POSTHOG_HOST = process.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

export const initPostHog = () => {
  if (typeof window !== 'undefined' && POSTHOG_KEY !== 'phc_placeholder') {
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: true,
        capture_pageview: true,
        persistence: 'localStorage'
    });
  }
};

export const trackPH = (event: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
};

export default posthog;
