// Shared constants — derived from the actual challenge registry so they stay in sync.
import { CHALLENGES } from '../challenges/index.js';

export const CHALLENGE_TOTAL = CHALLENGES.length;

/** Total number of challenges for a given level. */
export function levelTotal(level) {
  return CHALLENGES.filter((c) => c.level === level).length;
}
