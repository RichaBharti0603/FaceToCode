/**
 * Privacy-friendly Local Analytics
 * Tracks high-level events to localStorage for demo purposes.
 */

export type AnalyticsEvent = 
  | 'system_start' 
  | 'recording_start' 
  | 'recording_stop' 
  | 'screenshot_taken' 
  | 'pro_unlock' 
  | 'emotion_mode_toggle'
  | 'souvenir_downloaded'
  | 'souvenir_link_generated'
  | 'snapshot_shared'
  | 'session_reset';

export const trackEvent = (event: AnalyticsEvent, metadata: object = {}) => {
  try {
    const timestamp = new Date().toISOString();
    const currentLogs = JSON.parse(localStorage.getItem('ascii_analytics') || '[]');
    
    const newEntry = {
      event,
      timestamp,
      ...metadata
    };

    currentLogs.push(newEntry);
    
    // Keep only last 100 logs
    if (currentLogs.length > 100) currentLogs.shift();
    
    localStorage.setItem('ascii_analytics', JSON.stringify(currentLogs));
    
    // Log to console in debug/dev
    console.log(`[ANALYTICS] ${event}`, metadata);
  } catch (e) {
    console.error("Analytics tracking failed:", e);
  }
};

export const getAnalytics = () => {
  return JSON.parse(localStorage.getItem('ascii_analytics') || '[]');
};
