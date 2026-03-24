'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Award } from 'lucide-react';

interface UserProfileProps {
  address?: string;
  score: bigint;
  rank: number;
  achievements: number;
  maxScore?: bigint;
}

export function UserProfile({
  address,
  score,
  rank,
  achievements,
  maxScore = BigInt(1000),
}: UserProfileProps) {
  const scorePercent = Math.min(
    (Number(score) / Number(maxScore)) * 100,
    100
  );

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : 'Connect Wallet';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="p-6 border-2 border-purple-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-purple-500/20">
        <div className="space-y-4">
          {/* Wallet Info */}
          <div>
            <div className="text-xs text-purple-400 font-semibold mb-1">CONNECTED</div>
            <div className="font-mono text-sm font-bold text-cyan-300">
              {displayAddress}
            </div>
          </div>

          {/* Score Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-purple-300">SCORE</span>
              </div>
              <span className="text-xl font-bold text-amber-400">
                {score.toString()}
              </span>
            </div>
            <Progress value={scorePercent} className="h-2 bg-slate-700" />
          </div>

          {/* Rank Section */}
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-purple-500/50">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-purple-300">RANK</span>
            </div>
            <motion.span
              key={rank}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-cyan-300"
            >
              #{rank}
            </motion.span>
          </div>

          {/* Achievements Section */}
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-pink-500/50">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-semibold text-purple-300">ACHIEVEMENTS</span>
            </div>
            <motion.span
              key={achievements}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-xl font-bold text-pink-400"
            >
              {achievements}
            </motion.span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
