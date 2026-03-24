'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastBounce } from '@/lib/animations';
import { Zap, Trophy, Award } from 'lucide-react';

interface RewardNotificationProps {
  show: boolean;
  type: 'reward' | 'achievement' | 'rank';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function RewardNotification({
  show,
  type,
  title,
  description,
  icon,
  onClose,
  autoClose = true,
  duration = 3000,
}: RewardNotificationProps) {
  // Auto-close timer
  React.useEffect(() => {
    if (!show || !autoClose) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, autoClose, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'reward':
        return {
          bg: 'from-yellow-500 to-yellow-600',
          border: 'border-yellow-300',
          icon: icon || <Zap className="w-6 h-6" />,
        };
      case 'achievement':
        return {
          bg: 'from-purple-500 to-purple-600',
          border: 'border-purple-300',
          icon: icon || <Award className="w-6 h-6" />,
        };
      case 'rank':
        return {
          bg: 'from-green-500 to-green-600',
          border: 'border-green-300',
          icon: icon || <Trophy className="w-6 h-6" />,
        };
      default:
        return {
          bg: 'from-blue-500 to-blue-600',
          border: 'border-blue-300',
          icon: icon || <Zap className="w-6 h-6" />,
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={toastBounce}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed bottom-6 right-6 z-50"
        >
          <div
            className={`flex items-center gap-4 px-6 py-4 rounded-lg shadow-2xl border bg-gradient-to-r ${styles.bg} ${styles.border} text-white`}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="flex-shrink-0"
            >
              {styles.icon}
            </motion.div>

            <div className="flex-1">
              <div className="font-bold text-sm md:text-base">{title}</div>
              {description && (
                <div className="text-xs md:text-sm opacity-90 mt-1">{description}</div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
