export async function getGitHubStats(username: string) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }

        const data = await response.json();

        // Calculate commits (approximate based on repos and activity)
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
            next: { revalidate: 3600 }
        });

        const repos = await reposResponse.json();

        // Rough estimate: average 30-50 commits per repo
        const estimatedCommits = Array.isArray(repos) ? repos.length * 35 : 400;

        return {
            repos: data.public_repos || 0,
            commits: estimatedCommits
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        return {
            repos: 12,
            commits: 400
        };
    }
}

export function calculateExperience(startYear: number = 2022): number {
    const currentYear = new Date().getFullYear();
    return currentYear - startYear;
}

export function calculateProjects(experienceYears: number, monthsPerProject: number = 5): number {
    const totalMonths = experienceYears * 12;
    return Math.floor(totalMonths / monthsPerProject);
}
