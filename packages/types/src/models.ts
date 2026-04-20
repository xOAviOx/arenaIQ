import { Subject, Difficulty, MatchStatus, QuestionSource, RatingTier } from './enums';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  rating: number;
  ratingDeviation: number;
  volatility: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
}

export interface PublicUser {
  id: string;
  username: string;
  rating: number;
  tier: RatingTier;
  wins: number;
  losses: number;
}

export interface Question {
  id: string;
  latexQuestion: string;
  options: string[];
  correctOption: number;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  year?: number;
  source: QuestionSource;
  explanation?: string;
}

export interface QuestionForBattle extends Omit<Question, 'correctOption' | 'explanation'> {
  // correctOption and explanation are withheld during battle
}

export interface QuestionResult extends QuestionForBattle {
  correctOption: number;
  explanation?: string;
  player1Answer: number | null;
  player2Answer: number | null;
  firstCorrect: 'player1' | 'player2' | null;
}

export interface MatchSummary {
  id: string;
  player1: PublicUser;
  player2: PublicUser;
  winnerId: string | null;
  ratingDelta: number;
  status: MatchStatus;
  questions: QuestionResult[];
  createdAt: Date;
  completedAt: Date | null;
}

export interface LeaderboardEntry {
  rank: number;
  user: PublicUser;
  subject?: Subject;
}

export interface RatingChange {
  before: number;
  after: number;
  delta: number;
}
