import { Variants } from 'framer-motion';

/**
 * Reusable Framer Motion animation definitions
 * Used throughout the dashboard for consistent motion design
 */

// ============ Container Animations ============

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const slideInFromLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// ============ Badge/Reward Animations ============

export const badgePopIn: Variants = {
  initial: { opacity: 0, scale: 0.5, rotate: -10 },
  animate: { opacity: 1, scale: 1, rotate: 0 },
  exit: { opacity: 0, scale: 0.5 },
};

export const rewardDrop: Variants = {
  initial: { opacity: 0, y: -50, scale: 1.2 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export const rewardPulse = {
  initial: { scale: 0.9 },
  animate: { scale: [0.9, 1.1, 1] },
  transition: { duration: 0.6 },
};

// ============ Rank/Score Change Animations ============

export const rankChange: Variants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.3, 1], transition: { duration: 0.5 } },
};

export const scoreIncrease: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ============ Pipeline Step Animations ============

export const pipelineStep: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const stepPulse = {
  initial: { scale: 0.8 },
  animate: { scale: [0.8, 1.1, 1], transition: { duration: 0.5 } },
};

// ============ Loader Animations ============

export const spinner = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0%', '-200% 0%'],
    transition: { duration: 2, repeat: Infinity },
  },
};

// ============ Toast/Notification Animations ============

export const toastSlideIn: Variants = {
  initial: { opacity: 0, x: 20, y: 0 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 20, y: -10 },
};

export const toastBounce: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: [20, -5, 0] },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4 },
};

// ============ Leaderboard Animations ============

export const leaderboardRowHover = {
  initial: { x: 0 },
  hover: { x: 4, transition: { duration: 0.2 } },
};

export const leaderboardRowHighlight: Variants = {
  initial: { backgroundColor: 'transparent' },
  animate: { backgroundColor: ['transparent', 'rgba(59, 130, 246, 0.1)', 'transparent'] },
  transition: { duration: 1 },
};

// ============ Button Animations ============

export const buttonTap = {
  tap: { scale: 0.95 },
};

export const buttonHover = {
  hover: { scale: 1.02 },
};

// ============ Text Animations ============

export const countUp = {
  initial: 0,
  animate: (target: number) => ({
    textContent: target.toString(),
    transition: { duration: 0.5 },
  }),
};

// ============ Stagger Container ============

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};
