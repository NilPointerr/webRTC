const BASE_URL = process.env.NEXT_PUBLIC_AMS_URL || process.env.NEXT_PUBLIC_ANT_MEDIA_URL || 'http://localhost:5080';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'live';

export interface Broadcast {
  streamId: string;
  name: string;
  status: string;
  type: string;
  date: number;
  [key: string]: any;
}

export interface CreateBroadcastResponse {
  streamId: string;
  [key: string]: any;
}

/**
 * Create a new broadcast
 * Uses fetch with credentials: "include" as specified
 */
export async function createBroadcast(
  name: string = 'My Stream',
  appName: string = APP_NAME
): Promise<CreateBroadcastResponse> {
  try {
    const response = await fetch(`${BASE_URL}/${appName}/rest/v2/broadcasts/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include credentials for cookies
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Create broadcast error:', error);
    throw new Error(error.message || 'Failed to create broadcast');
  }
}


/**
 * Get publish URL - redirects to existing Ant Media publish page
 */
export function getPublishUrl(
  streamId: string,
  appName: string = APP_NAME,
  streamName?: string
): string {
  let url = `${BASE_URL}/${appName}/klaso/customIndex.html?id=${streamId}`;
  if (streamName) {
    url += `&name=${encodeURIComponent(streamName)}`;
  }
  return url;
}

/**
 * Get watch URL for a stream - uses existing Ant Media play page
 */
export function getWatchUrl(
  streamId: string,
  appName: string = APP_NAME,
  playOrder: 'webrtc' | 'hls' = 'webrtc'
): string {
  return `${BASE_URL}/${appName}/play.html?id=${streamId}&playOrder=${playOrder}`;
}

