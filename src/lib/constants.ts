// Scoring constants
export const POSITION_POINTS: Record<number, number> = {
  1: 5,
  2: 4,
  3: 3,
  4: 2,
  5: 1,
};

export const MAX_RANKINGS = 5;

// Bayesian average confidence threshold.
// A restaurant needs this many votes before its score leans more
// toward its own ratings than toward the global average.
// Set low (2) during early bootstrapping — bump back to 5 once
// we're averaging several dozen ballots and the leaderboard
// doesn't need training wheels.
export const BAYESIAN_CONFIDENCE = 2;

// Rate limiting
export const MAX_SUBMISSIONS_PER_HOUR = 10;

// Cookie name for visitor tracking
export const VISITOR_COOKIE_NAME = "abr_visitor_id";
export const VISITOR_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds
