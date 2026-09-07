// Challenge registry.
import { beginner } from './beginner.js';
import { intermediate } from './intermediate.js';
import { advanced } from './advanced.js';

export const CHALLENGES = [...beginner, ...intermediate, ...advanced];

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
