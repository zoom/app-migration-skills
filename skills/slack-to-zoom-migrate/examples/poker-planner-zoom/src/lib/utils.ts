/**
 * Utility functions for Poker Planner
 */

/**
 * Generate a unique session ID
 */
export function generateId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate average from numeric votes
 */
export function calculateAverage(votes: { [key: string]: string }): number | null {
  const numericVotes: number[] = [];

  for (const vote of Object.values(votes)) {
    const num = parseFloat(vote);
    if (!isNaN(num)) {
      numericVotes.push(num);
    }
  }

  if (numericVotes.length === 0) return null;

  const sum = numericVotes.reduce((a, b) => a + b, 0);
  return sum / numericVotes.length;
}

/**
 * Format vote results as text with vote counts
 */
export function formatVoteResults(votes: { [key: string]: string }): string {
  const voteCounts: { [point: string]: number } = {};

  for (const point of Object.values(votes)) {
    voteCounts[point] = (voteCounts[point] || 0) + 1;
  }

  const results: string[] = [];
  const sortedPoints = Object.keys(voteCounts).sort();

  for (const point of sortedPoints) {
    const count = voteCounts[point];
    const bar = '▰'.repeat(Math.min(count, 10));
    results.push(`*${point}*: ${count} vote(s) ${bar}`);
  }

  return results.join('\n');
}

/**
 * Parse custom points from command arguments
 * Example: "points:1,2,3,5,8" → ["1", "2", "3", "5", "8"]
 */
export function parseCustomPoints(args: string[]): string[] | null {
  const pointsArg = args.find(arg => arg.startsWith('points:'));
  if (!pointsArg) return null;

  const pointsString = pointsArg.substring(7); // Remove "points:" prefix
  const points = pointsString.split(',').map(p => p.trim()).filter(p => p.length > 0);

  return points.length > 0 ? points : null;
}

/**
 * Extract title from command text, excluding special arguments
 */
export function extractTitle(text: string, defaultTitle: string = 'Planning Session'): string {
  const words = text.trim().split(' ');
  const titleWords = words.filter(word =>
    !word.startsWith('points:') &&
    !word.startsWith('duration:') &&
    !word.startsWith('protected:')
  );

  return titleWords.length > 0 ? titleWords.join(' ') : defaultTitle;
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}
