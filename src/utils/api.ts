/**
 * Robust fetch wrapper with retry logic and better error handling
 * for Builder.io preview environment compatibility
 */

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = 3, retryDelay = 1000, ...fetchOptions } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Use native fetch (not the wrapped version)
      const nativeFetch = window.fetch.bind(window);
      const response = await nativeFetch(endpoint, fetchOptions);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Fetch attempt ${attempt + 1}/${retries + 1} failed:`, error);
      
      if (attempt < retries) {
        await sleep(retryDelay * (attempt + 1));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

export async function apiGet(
  endpoint: string,
  headers: Record<string, string> = {}
): Promise<Response> {
  return apiFetch(endpoint, { method: 'GET', headers });
}

export async function apiPost(
  endpoint: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
}

export async function apiPatch(
  endpoint: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
}

export async function apiDelete(
  endpoint: string,
  body: any,
  headers: Record<string, string> = {}
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
}

export async function apiPostFormData(
  endpoint: string,
  formData: FormData
): Promise<Response> {
  return apiFetch(endpoint, {
    method: 'POST',
    body: formData
  });
}
