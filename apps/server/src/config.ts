import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env['PORT'] ?? '4000', 10),
  clientUrl: process.env['CLIENT_URL'] ?? 'http://localhost:3000',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',

  redis: {
    url: requireEnv('UPSTASH_REDIS_REST_URL'),
    token: requireEnv('UPSTASH_REDIS_REST_TOKEN'),
  },

  // Battle constants
  battle: {
    totalQuestions: 7,
    questionTimeLimit: 90, // seconds
    betweenQuestionsDelay: 3000, // ms
    matchStartDelay: 5000, // ms after match_found
    reconnectWindow: 30000, // ms to reconnect before forfeit
  },

  // Matchmaking constants
  matchmaking: {
    pollIntervalMs: 500,
    initialRatingWindow: 200,
    windowExpansionPerStep: 50,
    windowExpansionIntervalMs: 10000,
  },
} as const;
