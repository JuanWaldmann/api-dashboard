const GITHUB_SECRET = process.env.GITHUB_SECRET;

if (!GITHUB_SECRET) {
  throw new Error('GITHUB_SECRET is not set');
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

    const result = await response.json();
    return result;
  } catch (err) {
    console.error(`Failed to fetch repo ${user}/${repo}`, err);
    throw err;
  }
}

export async function getUserRepos(username: string, page = 1, perPage = 1){
    const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${GITHUB_SECRET}` }
        });
        const result = await response.json();
        const linkHeader = response.headers.get('link')

        return { repos: result, linkHeader: linkHeader }
      

    }catch(err) {
        console.error(`failed to fetch page ${page}`, err);
        throw err;
    }
    
}


export function getNextPageUrl(linkHeader: string | null): string | null {
      if (!linkHeader) {
    return null;
  }

  const match = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}
