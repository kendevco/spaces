import { track as vercelTrack } from '@vercel/analytics';

// Client-side tracking
export const track = (event: string, properties?: Record<string, any>) => {
  vercelTrack(event, properties);
};

// Server-side tracking
export const trackServer = async (event: string, properties?: Record<string, any>) => {
  'use server';

  try {
    const response = await fetch('https://vitals.vercel-analytics.com/v1/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        properties,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error('Failed to track event:', event);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};
