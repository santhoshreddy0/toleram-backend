const POINTS = {
  SIX: 2,
  FOUR: 0,
  WICKET: 15,
  STUMP: 0,
  RUN_OUT: 0,
  CATCH: 0,
  MAIDEN_OVER: 5,
};

const DEFAULT_ROLE_MIN_LIMITS = {
  batsman: 3,
  bowler: 3,
  "all-rounder": 2,
  "wicket-keeper": 0,
};

const DEFAULT_ROLE_MAX_LIMITS = {
  batsman: 5,
  bowler: 5,
  "all-rounder": 4,
  "wicket-keeper": 12,
};


const LEADERBOARD_KEY = "leaderboard";
const LAST_UPDATED_KEY = "last_updated";
const LEADERBOARD_LIMIT = 10;

module.exports = {
  DEFAULT_NO_OF_PLAYERS: 12,
  DEFAULT_TOTAL_CREDITS: 100,
  DEFAULT_FEMALE_COUNT: 2,
  POINTS,
  DEFAULT_ROLE_MIN_LIMITS,
  DEFAULT_ROLE_MAX_LIMITS,
  LEADERBOARD_KEY,
  LAST_UPDATED_KEY,
  UPDATE_LEADERBOARD_KEY: "update_leaderboard",
  LEADERBOARD_LIMIT,
};
