'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RuleFormData, ActionType } from '@/lib/types';
import { Loader2, Plus } from 'lucide-react';

interface RuleFormProps {
  isLoading?: boolean;
  onSubmit: (data: RuleFormData) => Promise<void>;
}

const ACTION_TYPES = [
  { value: ActionType.MINT_REWARD, label: 'Mint Reward Tokens' },
  { value: ActionType.AWARD_BADGE, label: 'Award Badge' },
  { value: ActionType.UPDATE_SCORE, label: 'Update Score' },
];

const EVENT_TEMPLATES = [
  { name: 'SlayMonster', description: 'Defeat a monster' },
  { name: 'CompleteWorkout', description: 'Complete exercise session' },
  { name: 'MeditationSession', description: 'Meditate for duration' },
  { name: 'CustomEvent', description: 'Custom event' },
];

export function RuleForm({ isLoading = false, onSubmit }: RuleFormProps) {
  const [formData, setFormData] = useState<RuleFormData>({
    eventName: 'SlayMonster',
    condition: 'difficulty >= 1',
    actionType: ActionType.MINT_REWARD,
    rewardAmount: '50',
    badgeName: '',
    badgeMetadata: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        eventName: 'SlayMonster',
        condition: 'difficulty >= 1',
        actionType: ActionType.MINT_REWARD,
        rewardAmount: '50',
        badgeName: '',
        badgeMetadata: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedActionType = formData.actionType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 border-2 border-cyan-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-cyan-500/20">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-cyan-400" />
          Create Rule
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div>
            <Label htmlFor="eventName" className="text-sm font-semibold text-cyan-300">
              When Event
            </Label>
            <Select value={formData.eventName} onValueChange={(val) =>
              setFormData({ ...formData, eventName: val })
            }>
              <SelectTrigger id="eventName" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TEMPLATES.map((evt) => (
                  <SelectItem key={evt.name} value={evt.name}>
                    {evt.name} - {evt.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div>
            <Label htmlFor="condition" className="text-sm font-semibold text-cyan-300">
              Condition
            </Label>
            <Input
              id="condition"
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              placeholder="e.g., difficulty >= 1"
              className="mt-1"
            />
          </div>

          {/* Action Type */}
          <div>
            <Label htmlFor="actionType" className="text-sm font-semibold text-cyan-300">
              Then Action
            </Label>
            <Select value={String(formData.actionType)} onValueChange={(val) =>
              setFormData({ ...formData, actionType: Number(val) as ActionType })
            }>
              <SelectTrigger id="actionType" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_TYPES.map((action) => (
                  <SelectItem key={action.value} value={String(action.value)}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reward Amount */}
          <div>
            <Label htmlFor="rewardAmount" className="text-sm font-semibold text-cyan-300">
              Reward Amount
            </Label>
            <Input
              id="rewardAmount"
              type="number"
              value={formData.rewardAmount}
              onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
              placeholder="e.g., 50"
              className="mt-1"
            />
          </div>

          {/* Badge Fields (conditional) */}
          {selectedActionType === ActionType.AWARD_BADGE && (
            <>
              <div>
                <Label htmlFor="badgeName" className="text-sm font-semibold text-cyan-300">
                  Badge Name
                </Label>
                <Input
                  id="badgeName"
                  value={formData.badgeName}
                  onChange={(e) => setFormData({ ...formData, badgeName: e.target.value })}
                  placeholder="e.g., Monster Slayer"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="badgeMetadata" className="text-sm font-semibold text-cyan-300">
                  Description
                </Label>
                <Input
                  id="badgeMetadata"
                  value={formData.badgeMetadata}
                  onChange={(e) => setFormData({ ...formData, badgeMetadata: e.target.value })}
                  placeholder="Badge description"
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/50"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Rule...
              </>
            ) : (
              'Create Rule'
            )}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
