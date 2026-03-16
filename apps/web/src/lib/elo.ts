const K = 32;

/** Standard expected score: probability that player A beats player B. */
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new Elo ratings for a battle royale match.
 *
 * Each player is treated as having beaten everyone placed below them
 * and lost to everyone placed above them (pairwise comparison).
 *
 * @param placements - Agent IDs ordered by placement (index 0 = 1st place / winner)
 * @param currentRatings - Map of agent ID to current Elo rating
 * @returns Map of agent ID to new Elo rating
 */
export function calculateEloChanges(
  placements: string[],
  currentRatings: Record<string, number>
): Record<string, number> {
  const n = placements.length;
  const deltas: Record<string, number> = {};

  for (const id of placements) {
    deltas[id] = 0;
  }

  // For each pair, the higher-placed player "won" against the lower-placed one.
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const winner = placements[i];
      const loser = placements[j];

      const eWinner = expectedScore(currentRatings[winner], currentRatings[loser]);
      const eLoser = 1 - eWinner;

      // Scale K by number of opponents so total change stays reasonable.
      const k = K / (n - 1);

      deltas[winner] += k * (1 - eWinner);
      deltas[loser] += k * (0 - eLoser);
    }
  }

  const newRatings: Record<string, number> = {};
  for (const id of placements) {
    newRatings[id] = Math.round(currentRatings[id] + deltas[id]);
  }

  return newRatings;
}
