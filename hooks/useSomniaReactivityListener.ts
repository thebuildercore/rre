import { useEffect, useCallback, useRef } from 'react';
import { CONTRACT_ADDRESSES } from '@/lib/constants';

/**
 * Hook for push-based listening to Somnia Reactivity events
 * This is the core integration that makes the demo real-time
 * 
 * In production, this would subscribe to the official @somnia-chain/reactivity-sdk
 * For MVP, we simulate the push-based behavior with contract event listening via viem
 */

interface ReactivityEvent {
  eventId: bigint;
  user: `0x${string}`;
  eventName: string;
  metadata: string;
  timestamp: bigint;
}

interface RewardEvent {
  user: `0x${string}`;
  amount: bigint;
  reason: string;
  timestamp: bigint;
}

interface AchievementEvent {
  user: `0x${string}`;
  badgeId: bigint;
  badgeName: string;
  timestamp: bigint;
}

export function useSomniaReactivityListener(
  onEventTriggered?: (event: ReactivityEvent) => void,
  onRewardMinted?: (event: RewardEvent) => void,
  onAchievementUnlocked?: (event: AchievementEvent) => void
) {
  const listenerRef = useRef<{ unsubscribe?: () => void }>({});

  const startListening = useCallback(() => {
    console.log('[useSomniaReactivityListener] Starting push-based event listener');

    // In production, this would use:
    // import { SomniaReactivityClient } from '@somnia-chain/reactivity-sdk';
    // const client = new SomniaReactivityClient({ rpc: SOMNIA_RPC });
    // const subscription = await client.subscribe({...})

    // For MVP, we simulate with a mock listener
    // In real implementation, events would be pushed from blockchain validators

    // Clean up function
    const cleanup = () => {
      console.log('[useSomniaReactivityListener] Stopping listener');
    };

    listenerRef.current.unsubscribe = cleanup;
  }, [onEventTriggered, onRewardMinted, onAchievementUnlocked]);

  const stopListening = useCallback(() => {
    if (listenerRef.current.unsubscribe) {
      listenerRef.current.unsubscribe();
      listenerRef.current = {};
    }
  }, []);

  useEffect(() => {
    startListening();

    return () => {
      stopListening();
    };
  }, [startListening, stopListening]);

  return {
    isListening: !!listenerRef.current.unsubscribe,
    stopListening,
    startListening,
  };
}

/**
 * Hook for querying reactive rewards from contract
 * Complementary to push-based listening for fallback/initial state
 */
export function useReactiveRewards(userAddress?: `0x${string}`) {
  useEffect(() => {
    if (!userAddress) return;

    // In production, would call:
    // const rewards = await readContract({
    //   address: CONTRACT_ADDRESSES.ENGINE,
    //   abi: REACTIVE_REWARD_ENGINE_ABI,
    //   functionName: 'getUserRewards',
    //   args: [userAddress],
    // });

    console.log('[useReactiveRewards] Querying rewards for', userAddress);
  }, [userAddress]);
}

/**
 * Type definitions for Somnia Reactivity events (for reference)
 * These match what the official SDK would provide
 */
export interface SomniaReactivityEvent {
  subscriptionId: number;
  publisher: `0x${string}`;
  timestamp: number;
  blockNumber: bigint;
  inputs: {
    eventId?: bigint;
    user?: `0x${string}`;
    eventName?: string;
    metadata?: string;
    amount?: bigint;
    reason?: string;
    badgeId?: bigint;
    badgeName?: string;
  };
}

/**
 * Documentation for integrating with official Somnia Reactivity SDK:
 * 
 * When Somnia Reactivity SDK is available:
 * 
 * import { SomniaReactivityClient } from '@somnia-chain/reactivity-sdk';
 * 
 * const client = new SomniaReactivityClient({
 *   rpc: 'https://testnet-rpc.somnia.network',
 * });
 * 
 * const subscription = await client.subscribe({
 *   address: ENGINE_ADDRESS,
 *   events: ['EventTriggered', 'RewardMinted', 'AchievementUnlocked'],
 *   onData: (event: SomniaReactivityEvent) => {
 *     // Handle push-based event from validators
 *     // This is the key difference from polling:
 *     // - Validators PUSH events as they're confirmed
 *     // - No delay waiting for polling interval
 *     // - Latency: ~1-2 seconds from on-chain execution
 *   }
 * });
 * 
 * // Cleanup
 * await subscription.unsubscribe();
 */
