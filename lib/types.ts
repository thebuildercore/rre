// ============ Rule Types ============

export enum ActionType {
  MINT_REWARD = 0,
  AWARD_BADGE = 1,
  UPDATE_SCORE = 2,
}

export interface Rule {
  id: number;
  eventName: string;
  condition: string;
  actionType: ActionType;
  rewardAmount: bigint;
  badgeName: string;
  badgeMetadata: string;
  owner: `0x${string}`;
  isActive: boolean;
  createdAt: number;
}

// ============ Event Types ============

export interface RewardEvent {
  id: number;
  user: `0x${string}`;
  eventName: string;
  metadata: string;
  timestamp: number;
  processed: boolean;
}

// ============ Player & Leaderboard Types ============

export interface PlayerStats {
  playerAddress: `0x${string}`;
  score: bigint;
  rank: number;
  achievementCount: number;
  lastScoreUpdate: number;
  isActive: boolean;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  earnedBy: `0x${string}`;
  earnedAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: `0x${string}`;
  score: bigint;
  achievements: number;
}

// ============ Live Event Pipeline Types ============

export enum PipelineStep {
  USER_ACTION = "User Action",
  EVENT_EMITTED = "Event Emitted",
  SDK_TRIGGERED = "SDK Triggered",
  CONDITION_CHECKED = "Condition Checked",
  ACTION_EXECUTED = "Action Executed",
  STATE_UPDATED = "State Updated",
}

export interface PipelineEvent {
  id: string;
  step: PipelineStep;
  user: `0x${string}`;
  eventName: string;
  timestamp: number;
  data?: {
    rewardAmount?: bigint;
    badgeName?: string;
    newRank?: number;
    oldRank?: number;
  };
  isActive?: boolean;
  completedAt?: number;
}

// ============ Frontend State Types ============

export interface AppState {
  userAddress: `0x${string}` | null;
  currentScore: bigint;
  currentRank: number;
  achievements: Achievement[];
  recentRewards: RewardEvent[];
  leaderboard: LeaderboardEntry[];
  activePipelineEvent: PipelineEvent | null;
}

export interface RuleFormData {
  eventName: string;
  condition: string;
  actionType: ActionType;
  rewardAmount: string;
  badgeName: string;
  badgeMetadata: string;
}
