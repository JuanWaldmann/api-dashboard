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