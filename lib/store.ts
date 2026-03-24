import { create } from 'zustand';
import { AppState, PipelineEvent, Achievement, LeaderboardEntry } from './types';

interface AppStore extends AppState {
  // User & Score Management
  setUserAddress: (address: `0x${string}` | null) => void;
  setCurrentScore: (score: bigint) => void;
  setCurrentRank: (rank: number) => void;
  
  // Achievements
  setAchievements: (achievements: Achievement[]) => void;
  addAchievement: (achievement: Achievement) => void;
  
  // Pipeline Events
  setActivePipelineEvent: (event: PipelineEvent | null) => void;
  addRecentReward: (reward: any) => void;
  clearRecentRewards: () => void;
  
  // Leaderboard
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  
  // Reset
  reset: () => void;
}

const initialState: AppState = {
  userAddress: null,
  currentScore: BigInt(0),
  currentRank: 0,
  achievements: [],
  recentRewards: [],
  leaderboard: [],
  activePipelineEvent: null,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  
  setUserAddress: (address) => set({ userAddress: address }),
  setCurrentScore: (score) => set({ currentScore: score }),
  setCurrentRank: (rank) => set({ currentRank: rank }),
  
  setAchievements: (achievements) => set({ achievements }),
  addAchievement: (achievement) => 
    set((state) => ({
      achievements: [achievement, ...state.achievements],
    })),
  
  setActivePipelineEvent: (event) => set({ activePipelineEvent: event }),
  addRecentReward: (reward) =>
    set((state) => ({
      recentRewards: [reward, ...state.recentRewards].slice(0, 10), // Keep last 10
    })),
  clearRecentRewards: () => set({ recentRewards: [] }),
  
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  
  reset: () => set(initialState),
}));
