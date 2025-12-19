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
    const url = `${BASE_URL}/${appName}/rest/v2/broadcasts/create`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Important: include credentials for cookies
      mode: 'cors',
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch (e2) {
          // Ignore
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Create broadcast error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ${BASE_URL}. Please check if Ant Media Server is running.`);
    }
    
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

/**
 * List broadcasts for an application
 */
export async function listBroadcasts(
  appName: string = APP_NAME,
  offset: number = 0,
  size: number = 50
): Promise<Broadcast[]> {
  const url = `${BASE_URL}/${appName}/rest/v2/broadcasts/list/${offset}/${size}`;
  console.log('Fetching broadcasts from:', url);
  
  // Try with credentials first, then without if it fails
  const tryFetch = async (withCredentials: boolean) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: withCredentials ? 'include' : 'omit',
      mode: 'cors',
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        try {
          const text = await response.text();
          if (text) errorMessage = text;
        } catch (e2) {
          // Ignore
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  try {
    // First try with credentials
    return await tryFetch(true);
  } catch (error: any) {
    console.warn('Fetch with credentials failed, trying without:', error.message);
    
    // If it's a network/CORS error, try without credentials
    if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('CORS')) {
      try {
        return await tryFetch(false);
      } catch (retryError: any) {
        console.error('List broadcasts error (retry failed):', retryError);
        
        // Handle specific error types
        if (retryError.name === 'TypeError' && retryError.message.includes('fetch')) {
          throw new Error(`Network error: Unable to connect to ${BASE_URL}. Please check if Ant Media Server is running and accessible.`);
        }
        
        throw new Error(retryError.message || 'Failed to list broadcasts');
      }
    }
    
    // Re-throw if it's not a network error
    throw error;
  }
}

/**
 * Get broadcast by ID
 */
export async function getBroadcast(
  streamId: string,
  appName: string = APP_NAME
): Promise<Broadcast> {
  try {
    const response = await fetch(`${BASE_URL}/${appName}/rest/v2/broadcasts/${streamId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Get broadcast error:', error);
    throw new Error(error.message || 'Failed to get broadcast');
  }
}

/**
 * Get list of applications (common Ant Media apps)
 * Note: This is a helper function. In production, you might want to call an API endpoint
 * if Ant Media Server provides one to list all applications.
 */
export function getCommonApplications(): string[] {
  return ['live', 'klaso', 'WebRTCApp', 'LiveApp'];
}

