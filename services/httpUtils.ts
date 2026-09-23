export function checkResponseOk(response: Response): void {
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
}

function isRetryable(status: number): boolean {
  return status >= 500 && status < 600;
}
function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchWithRetry(fetchAttempt: () => Promise<Response>, maxAttempts = 5): Promise <Response>{
  for (let attempt = 0; attempt < maxAttempts; attempt++){
    const response = await fetchAttempt();

    if(!isRetryable(response.status)){
      return response;
    }

    if (attempt === maxAttempts -1){
      return response;
    }

    await wait(1000 * 2 ** attempt);
  }
  throw new Error('fetchWithRetry: unreachable');
}
