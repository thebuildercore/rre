'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PipelineEvent, PipelineStep } from '@/lib/types';
import { CheckCircle2, Circle, Zap } from 'lucide-react';

interface EventPipelineVisualizerProps {
  event: PipelineEvent | null;
  isProcessing?: boolean;
}

const STEPS = [
  { step: PipelineStep.USER_ACTION, icon: '👆', color: 'from-blue-500 to-blue-600' },
  { step: PipelineStep.EVENT_EMITTED, icon: '📤', color: 'from-indigo-500 to-indigo-600' },
  { step: PipelineStep.SDK_TRIGGERED, icon: '⚡', color: 'from-purple-500 to-purple-600' },
  { step: PipelineStep.CONDITION_CHECKED, icon: '✓', color: 'from-cyan-500 to-cyan-600' },
  { step: PipelineStep.ACTION_EXECUTED, icon: '🎯', color: 'from-teal-500 to-teal-600' },
  { step: PipelineStep.STATE_UPDATED, icon: '🎉', color: 'from-green-500 to-green-600' },
];

function getStepIndex(step: PipelineStep): number {
  return STEPS.findIndex((s) => s.step === step);
}

export function EventPipelineVisualizer({
  event,
  isProcessing = false,
}: EventPipelineVisualizerProps) {
  const currentStepIndex = event ? getStepIndex(event.step) : -1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="p-6 border-2 border-purple-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Reactivity Pipeline
        </h3>

        <div className="space-y-6">
          {/* Event Info */}
          <AnimatePresence mode="wait">
            {event && (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-slate-700/50 rounded-lg border border-purple-500/50"
              >
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-purple-300 font-semibold">Event:</span>
                    <span className="ml-2 font-mono text-purple-200">{event.eventName}</span>
                  </div>
                  <div>
                    <span className="text-purple-300 font-semibold">User:</span>
                    <span className="ml-2 font-mono text-purple-200">
                      {event.user.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pipeline Steps */}
          <div className="space-y-3">
            {STEPS.map((stepDef, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrentStep = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;

              return (
                <motion.div
                  key={stepDef.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  {/* Step Icon */}
                  <div className="flex-shrink-0 pt-1">
                    <motion.div
                      animate={
                        isCurrentStep
                          ? {
                              scale: [1, 1.2, 1],
                              rotate: [0, 5, -5, 0],
                            }
                          : {}
                      }
                      transition={
                        isCurrentStep
                          ? { duration: 0.6, repeat: Infinity }
                          : {}
                      }
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrentStep
                          ? `bg-gradient-to-r ${stepDef.color} text-white`
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isCurrentStep ? (
                        stepDef.icon
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </motion.div>
                  </div>

                  {/* Step Content */}
                  <motion.div
                    className={`flex-1 p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-700 border-2 border-purple-500/50'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-white">{stepDef.step}</div>
                    <div className="text-sm text-purple-200 mt-1">
                      {getStepDescription(stepDef.step, event)}
                    </div>

                    {isCurrentStep && event?.data && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pt-3 border-t border-slate-600 text-xs text-purple-300"
                      >
                        {event.data.rewardAmount && (
                          <div>
                            💰 Reward: {event.data.rewardAmount.toString()} tokens
                          </div>
                        )}
                        {event.data.badgeName && (
                          <div>🏅 Badge: {event.data.badgeName}</div>
                        )}
                        {event.data.newRank && (
                          <div>
                            📈 Rank: {event.data.oldRank} → {event.data.newRank}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="absolute left-4 top-16 w-0.5 h-12 bg-gradient-to-b from-gray-300 to-gray-100" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center gap-3 shadow-lg shadow-cyan-500/20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg"
              >
                ⚙️
              </motion.div>
              <span className="text-sm font-semibold text-cyan-300">
                Processing reaction... Sub-second push via Somnia Reactivity
              </span>
            </motion.div>
          )}

          {/* No Event State */}
          {!event && !isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600"
            >
              <div className="text-4xl mb-2">⏳</div>
              <p className="text-purple-300 font-semibold">Waiting for action...</p>
              <p className="text-sm text-purple-400 mt-1">
                Click an action button in the Arena to start the pipeline
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function getStepDescription(step: PipelineStep, event: PipelineEvent | null): string {
  switch (step) {
    case PipelineStep.USER_ACTION:
      return 'User clicked action button';
    case PipelineStep.EVENT_EMITTED:
      return `Event "${event?.eventName}" emitted to ReactiveRewardEngine`;
    case PipelineStep.SDK_TRIGGERED:
      return 'Somnia Reactivity SDK detected event via push (no polling)';
    case PipelineStep.CONDITION_CHECKED:
      return 'Rule condition validated on-chain';
    case PipelineStep.ACTION_EXECUTED:
      return 'Reward action executed instantly by EventHandler';
    case PipelineStep.STATE_UPDATED:
      return 'Leaderboard and achievements updated on-chain';
    default:
      return '';
  }
}
