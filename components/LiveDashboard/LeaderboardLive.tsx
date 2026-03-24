'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LeaderboardEntry } from '@/lib/types';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface LeaderboardLiveProps {
  entries: LeaderboardEntry[];
  currentUserAddress?: `0x${string}`;
  isLoading?: boolean;
}

export function LeaderboardLive({
  entries,
  currentUserAddress,
  isLoading = false,
}: LeaderboardLiveProps) {
  const sortedEntries = [...entries].sort((a, b) => a.rank - b.rank).slice(0, 10);

  const currentUserEntry = entries.find(
    (e) => e.address.toLowerCase() === currentUserAddress?.toLowerCase()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 border-2 border-amber-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-amber-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          Leaderboard (Top 10)
        </h3>

        <div className="space-y-2">
          {sortedEntries.length === 0 ? (
            <div className="p-8 text-center text-purple-400">
              {isLoading ? 'Loading leaderboard...' : 'No players yet'}
            </div>
          ) : (
            sortedEntries.map((entry, index) => {
              const isCurrentUser = entry.address.toLowerCase() === currentUserAddress?.toLowerCase();

              return (
                <motion.div
                  key={`${entry.address}-${entry.rank}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrentUser
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-700/30 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        entry.rank === 1
                          ? 'bg-yellow-500'
                          : entry.rank === 2
                          ? 'bg-gray-400'
                          : entry.rank === 3
                          ? 'bg-orange-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {entry.rank}
                    </motion.div>

                    {/* Address */}
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-purple-200 truncate">
                        {entry.address.slice(0, 10)}...{entry.address.slice(-6)}
                      </div>
                      {isCurrentUser && (
                        <Badge className="mt-1 bg-cyan-600 text-white">You</Badge>
                      )}
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <motion.div
                        key={entry.score.toString()}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-lg font-bold text-amber-400"
                      >
                        {entry.score.toString()}
                      </motion.div>
                      <div className="text-xs text-purple-400">points</div>
                    </div>

                    {/* Achievements */}
                    <div className="text-right">
                      <motion.div
                        key={entry.achievements}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        className="text-lg font-bold text-pink-400"
                      >
                        {entry.achievements}
                      </motion.div>
                      <div className="text-xs text-purple-400">badges</div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Current User Rank Display */}
        {currentUserEntry && !sortedEntries.some((e) => e.address === currentUserEntry.address) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-cyan-500/10 border-2 border-cyan-500/50 rounded-lg"
          >
            <div className="text-sm font-semibold text-cyan-300 mb-2">Your Rank</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-cyan-200">
                #{currentUserEntry.rank} • {currentUserEntry.score.toString()} points
              </span>
              <span className="text-sm font-bold text-pink-400">
                {currentUserEntry.achievements} badges
              </span>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
