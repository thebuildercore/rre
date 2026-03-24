'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ActionButton } from '@/components/Arena/ActionButton';
import { UserProfile } from '@/components/Arena/UserProfile';
import { RuleForm } from '@/components/RuleBuilder/RuleForm';
import { EventPipelineVisualizer } from '@/components/LiveDashboard/EventPipelineVisualizer';
import { LeaderboardLive } from '@/components/LiveDashboard/LeaderboardLive';
import { useAppStore } from '@/lib/store';
import { PipelineEvent, PipelineStep, RuleFormData } from '@/lib/types';
import { Zap, Sword, Dumbbell, Brain } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // App state
  const {
    userAddress,
    currentScore,
    currentRank,
    achievements,
    activePipelineEvent,
    leaderboard,
    setUserAddress,
    setCurrentScore,
    setCurrentRank,
    setActivePipelineEvent,
    setLeaderboard,
  } = useAppStore();

  // Initialize demo mode
  useEffect(() => {
    // Simulate user connection
    setUserAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f42838');

    // Simulate demo leaderboard
    setLeaderboard([
      {
        rank: 1,
        address: '0x1111111111111111111111111111111111111111' as `0x${string}`,
        score: BigInt(500),
        achievements: 5,
      },
      {
        rank: 2,
        address: '0x2222222222222222222222222222222222222222' as `0x${string}`,
        score: BigInt(450),
        achievements: 4,
      },
      {
        rank: 3,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f42838' as `0x${string}`,
        score: BigInt(150),
        achievements: 1,
      },
      {
        rank: 4,
        address: '0x3333333333333333333333333333333333333333' as `0x${string}`,
        score: BigInt(100),
        achievements: 2,
      },
    ]);

    setCurrentScore(BigInt(150));
    setCurrentRank(3);
  }, []);

  // Simulate action execution with pipeline animation
  const executeAction = async (eventName: string, reward: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const pipelineId = `${Date.now()}-${Math.random()}`;

    try {
      // Step 1: User Action
      setActivePipelineEvent({
        id: pipelineId,
        step: PipelineStep.USER_ACTION,
        user: userAddress || ('0x0' as `0x${string}`),
        eventName,
        timestamp: Date.now(),
        isActive: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 2: Event Emitted
      setActivePipelineEvent({
        id: pipelineId,
        step: PipelineStep.EVENT_EMITTED,
        user: userAddress || ('0x0' as `0x${string}`),
        eventName,
        timestamp: Date.now(),
        isActive: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 3: SDK Triggered
      setActivePipelineEvent({
        id: pipelineId,
        step: PipelineStep.SDK_TRIGGERED,
        user: userAddress || ('0x0' as `0x${string}`),
        eventName,
        timestamp: Date.now(),
        isActive: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 4: Condition Checked
      setActivePipelineEvent({
        id: pipelineId,
        step: PipelineStep.CONDITION_CHECKED,
        user: userAddress || ('0x0' as `0x${string}`),
        eventName,
        timestamp: Date.now(),
        isActive: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 5: Action Executed
      const rewardAmount = BigInt(reward.split(' ')[0]);
      setActivePipelineEvent({
        id: pipelineId,
        step: PipelineStep.ACTION_EXECUTED,
        user: userAddress || ('0x0' as `0x${string}`),
        eventName,
        timestamp: Date.now(),
        isActive: true,
        data: {
          rewardAmount,
          badgeName: eventName === 'CompleteWorkout' ? 'Fitness Master' : undefined,
          oldRank: currentRank,
          newRank: currentRank - 1,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Step 6: State Updated
      const newScore = currentScore + rewardAmount;
      const newRank = Math.max(1, currentRank - 1);

      setActivePipelineEvent({
        id: pipelineId,
        step: PipelineStep.STATE_UPDATED,
        user: userAddress || ('0x0' as `0x${string}`),
        eventName,
        timestamp: Date.now(),
        isActive: false,
        completedAt: Date.now(),
        data: {
          rewardAmount,
          oldRank: currentRank,
          newRank,
        },
      });

      // Update user state
      setCurrentScore(newScore);
      setCurrentRank(newRank);

      // Update leaderboard simulation
      setLeaderboard(
        leaderboard.map((entry) =>
          entry.address === userAddress
            ? {
                ...entry,
                rank: newRank,
                score: newScore,
                achievements: entry.achievements + 1,
              }
            : entry
        )
      );

      await new Promise((resolve) => setTimeout(resolve, 1500));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRuleSubmit = async (data: RuleFormData) => {
    console.log('Rule submitted:', data);
    // In real implementation, this would call the contract
    // For now, just show success
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              Somnia Reactive Reward Engine
            </h1>
          </div>
          <p className="text-purple-300 text-lg">
            Push-based sub-second rewards & leaderboard updates via Somnia Reactivity
          </p>
        </motion.div>

        {/* Main Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Arena + Rule Builder */}
          <div className="space-y-6">
            {/* User Profile */}
            <UserProfile
              address={userAddress}
              score={currentScore}
              rank={currentRank}
              achievements={achievements.length}
            />

            {/* Arena Actions */}
            <div>
              <h2 className="text-xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                <Sword className="w-5 h-5 text-purple-400" />
                Arena / Quest View
              </h2>
              <div className="space-y-3">
                <ActionButton
                  label="Slay Monster"
                  eventName="SlayMonster"
                  description="Defeat an enemy monster"
                  reward="50 tokens"
                  isLoading={isProcessing}
                  onClick={() => executeAction('SlayMonster', '50')}
                  icon="⚔️"
                />
                <ActionButton
                  label="Complete Workout"
                  eventName="CompleteWorkout"
                  description="Finish exercise session"
                  reward="30 points + Badge"
                  isLoading={isProcessing}
                  onClick={() => executeAction('CompleteWorkout', '30')}
                  icon={<Dumbbell className="w-4 h-4" />}
                />
                <ActionButton
                  label="Meditation Session"
                  eventName="MeditationSession"
                  description="Complete mindfulness session"
                  reward="20 points"
                  isLoading={isProcessing}
                  onClick={() => executeAction('MeditationSession', '20')}
                  icon={<Brain className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Rule Builder */}
            <div>
              <h2 className="text-xl font-bold text-cyan-300 mb-4">Create Custom Rule</h2>
              <RuleForm onSubmit={handleRuleSubmit} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Panel: Live Dashboard */}
          <div className="space-y-6">
            {/* Event Pipeline Visualizer */}
            <EventPipelineVisualizer event={activePipelineEvent} isProcessing={isProcessing} />

            {/* Leaderboard */}
            <LeaderboardLive
              entries={leaderboard}
              currentUserAddress={userAddress}
              isLoading={false}
            />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/30 text-center shadow-lg shadow-purple-500/10"
        >
          <p className="text-purple-300 text-sm">
            <span className="font-semibold text-purple-400">Powered by Somnia Reactivity</span> — No polling, no keepers, no external infrastructure.
            Every action triggers instant on-chain reactions via push-based validators.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
