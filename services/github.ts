const GITHUB_SECRET = process.env.GITHUB_SECRET;

if (!GITHUB_SECRET) {
  throw new Error('GITHUB_SECRET is not set');
}

interface RateLimitInfo {
  remaining: number | null;
  resetInMinutes: number;
}

/**
 * Extracts GitHub's rate limit headers from a response into a clean, structured shape.
 */

function getRateLimitInfo(response: Response): RateLimitInfo {
  const remainingHeader = response.headers.get('x-ratelimit-remaining');
  const resetTimestamp = Number(response.headers.get('x-ratelimit-reset'));

  const now = Math.floor(Date.now() / 1000);
  const secondsRemaining = resetTimestamp - now
  const resetInMinutes = Math.floor(secondsRemaining / 60);

  return {
    remaining: remainingHeader !== null ? Number(remainingHeader) : null,
    resetInMinutes
  };
}


/**
 * Fetches a single repository's details from the GitHub API.
 */
export async function getRepo(user: string, repo: string) {
  const url = `https://api.github.com/repos/${user}/${repo}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${GITHUB_SECRET}` }
    });

    const repoData = await response.json();

    return {
      repo: repoData,
      rateLimit: getRateLimitInfo(response)
    };
  } catch (err) {
    console.error(`Failed to fetch repo ${user}/${repo}`, err);
    throw err
  }
}

/**
 * Fetches a paginated list of a user's public repositories.
 */

export async function getUserRepos(username: string, page = 1, perPage = 1) {
  const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${GITHUB_SECRET}` }
    });

    const repos = await response.json();

    return {
      repos,
      linkHeader: response.headers.get('link'),
      rateLimit: getRateLimitInfo(response)
    };
  }catch (err){
    console.error(`Failed to fetch repos for ${username}`, err);
    throw err;
  }
}


function extractRelUrl(linkHeader: string | null, rel: string): string | null {
  if (!linkHeader){
    return null;
  }
  const match = linkHeader.match(new RegExp(`<([^>]+)>;\\s*rel="${rel}"`));
  return match ? match[1] : null;
}


export function getNextPageUrl(linkHeader: string | null): string | null {
  return extractRelUrl(linkHeader, 'next')
}

export function getPrevPageUrl(linkHeader: string | null): string | null {
  return extractRelUrl(linkHeader, 'prev')
}

export function getFirstPageUrl(linkHeader: string | null): string | null {
  return extractRelUrl(linkHeader, 'first')
}

export function getlastPageUrl(linkHeader: string | null): string | null {
  return extractRelUrl(linkHeader, 'last')
}
