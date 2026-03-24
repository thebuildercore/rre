'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  eventName: string;
  description: string;
  reward: string;
  isLoading?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function ActionButton({
  label,
  eventName,
  description,
  reward,
  isLoading = false,
  onClick,
  icon,
}: ActionButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Button
        onClick={onClick}
        disabled={isLoading}
        className="w-full h-auto py-4 px-6 flex flex-col items-start gap-2 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white border border-purple-500/50 hover:border-purple-400 shadow-lg shadow-purple-500/20"
      >
        <div className="flex items-center gap-2 w-full">
          {icon && <div className="text-lg">{icon}</div>}
          <div className="flex-1">
            <div className="font-bold text-base text-white">{label}</div>
            <div className="text-xs text-purple-300">{description}</div>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
        </div>
        <div className="text-xs bg-purple-500/30 px-2 py-1 rounded-full text-purple-200 border border-purple-500/50">
          {reward}
        </div>
      </Button>
    </motion.div>
  );
}
