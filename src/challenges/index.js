// Challenge registry.
import { beginner } from './beginner.js';
import { intermediate } from './intermediate.js';
import { advanced } from './advanced.js';
import { school } from './school.js';
import { shop } from './shop.js';
import { library } from './library.js';

// Ordered by level first (beginner → intermediate → advanced) so challenge
// numbers run sequentially within each level. Within a level, company_db
// challenges come first, then the other databases.
const SETS = [beginner, intermediate, advanced, school, shop, library];
const byLevel = (level) => SETS.flat().filter((c) => c.level === level);

export const CHALLENGES = [...byLevel('beginner'), ...byLevel('intermediate'), ...byLevel('advanced')];

export const LEVELS = ['beginner', 'intermediate', 'advanced'];

export function getChallenge(id) {
  return CHALLENGES.find((c) => c.id === id);
}

export function challengeNumber(c) {
  return CHALLENGES.indexOf(c) + 1;
}

export const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
