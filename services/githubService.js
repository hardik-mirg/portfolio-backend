const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'hardik-mirg';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

let cache = {
  stats: null,
  commits: null,
  timestamp: 0
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  if (isNaN(diffMs)) return dateString;

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} hour${diffMin > 1 ? 's' : ''}`.replace('hour', 'minute') + ' ago';

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

async function githubFetch(url) {
  const headers = {
    'User-Agent': 'Portfolio-Backend',
    'Accept': 'application/vnd.github+json'
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API request failed for ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getStatsAndCommits() {
  const now = Date.now();
  if (cache.stats && cache.commits && (now - cache.timestamp < CACHE_DURATION)) {
    return { stats: cache.stats, commits: cache.commits };
  }

  try {
    // 1. Fetch User Profile
    const profile = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}`);

    // 2. Fetch Repos to sum stars
    const repos = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

    // 3. Estimate/Fetch Commits
    let totalCommits = '340+'; // Default fallback matching previous mock
    try {
      // Query commits search api (requires GITHUB_TOKEN or will hit low rate limit)
      const searchRes = await githubFetch(`https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}`);
      if (searchRes && typeof searchRes.total_count === 'number') {
        totalCommits = `${searchRes.total_count}+`;
      }
    } catch (err) {
      console.warn('Failed to fetch total commits count, using fallback:', err.message);
    }

    // 4. Events / Recent Commits
    const events = await githubFetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`);
    const formattedCommits = [];

    for (const event of events) {
      if (event.type === 'PushEvent' && event.payload && event.payload.commits) {
        const repoName = event.repo.name.split('/').pop();
        const branch = event.payload.ref.replace('refs/heads/', '');

        for (const commit of event.payload.commits) {
          formattedCommits.push({
            sha: commit.sha.substring(0, 6),
            repo: repoName,
            branch: branch,
            message: commit.message,
            time: getRelativeTime(event.created_at)
          });

          if (formattedCommits.length >= 5) break;
        }
      }
      if (formattedCommits.length >= 5) break;
    }

    if (formattedCommits.length === 0) {
      const sampleCommits = [
        {
          sha: "a87fd9",
          repo: "life",
          branch: "main",
          message: "Living to the fullest!",
          time: "2 hours ago"
        },
        {
          sha: "f23ed9",
          repo: "work",
          branch: "main",
          message: "Curiosity for Life!!",
          time: "Just now"
        },
        {
          sha: "2df24d2",
          repo: "passion",
          branch: "main",
          message: "for the love of science",
          time: "yesterday"
        }
      ]

      sampleCommits.forEach(commit => {
        formattedCommits.push(commit);
      });
    }

    cache.stats = {
      commits: totalCommits,
      repositories: String(profile.public_repos || repos.length),
      stars: String(totalStars),
      views: '1,250+' // Kept static/fallback since Views API requires push-access token
    };
    cache.commits = formattedCommits;
    cache.timestamp = now;

    return { stats: cache.stats, commits: cache.commits };
  } catch (error) {
    console.error('Error fetching data from GitHub API:', error);
    // Return cached data if available, even if expired, or default empty structure
    return {
      stats: cache.stats || { commits: '340+', repositories: '18', stars: '95', views: '1,250+' },
      commits: cache.commits || []
    };
  }
}

module.exports = {
  getStatsAndCommits
};
