# Integration Guide: Using Somnia Reactive Reward Engine in Your dApp

This guide shows how to integrate the Somnia Reactive Reward Engine into your own decentralized applications.

## Overview

The Reactive Reward Engine is designed to be modular and composable. Instead of building your own reactive infrastructure, you can:

1. **Use our contracts directly** - Deploy and customize for your needs
2. **Listen to leaderboard events** - Subscribe to score/achievement updates in your UI
3. **Inherit our event handlers** - Extend EventHandler for custom logic
4. **Create your own rules** - Register custom reactions specific to your dApp

## Integration Methods

### Method 1: Direct Contract Usage

Use the deployed RewardEngine and LeaderboardRegistry directly without modification.

#### Step 1: Get Contract Addresses

```typescript
// From your deployment
const ENGINE_ADDRESS = "0x..."; // ReactiveRewardEngine
const LEADERBOARD_ADDRESS = "0x..."; // LeaderboardRegistry
const HANDLER_ADDRESS = "0x..."; // EventHandler
```

#### Step 2: Emit Events from Your dApp

```solidity
// In your smart contract
interface IReactiveRewardEngine {
  function emitCustomEvent(string memory eventName, string memory metadata) external;
}

contract MyGame {
  IReactiveRewardEngine public rewardEngine = IReactiveRewardEngine(ENGINE_ADDRESS);
  
  function completeQuest(address player, string memory questName) external {
    // Your game logic
    
    // Emit event to trigger rewards
    rewardEngine.emitCustomEvent(
      "QuestCompleted",
      abi.encode(questName, block.timestamp)
    );
  }
}
```

#### Step 3: Register Custom Rules

```typescript
// In your frontend
const ruleId = await engine.registerRule(
  "QuestCompleted",        // eventName
  "questDifficulty >= 3",  // condition
  ActionType.AWARD_BADGE,  // actionType
  BigInt(0),               // rewardAmount
  "Quest Master",          // badgeName
  "Completed a difficult quest"
);
```

#### Step 4: Listen to Updates in Your UI

```typescript
import { useSomniaReactivityListener } from '@somnia-reward-engine/hooks';

export function MyGameUI() {
  useSomniaReactivityListener(
    (event) => {
      if (event.eventName === 'QuestCompleted') {
        showQuestCompletedAnimation();
        refreshPlayerStats();
      }
    }
  );
}
```

### Method 2: Inherit EventHandler

Create a custom EventHandler that extends the base implementation.

```solidity
// contracts/MyCustomHandler.sol
import { EventHandler } from "@somnia-reward-engine/contracts/EventHandler.sol";

contract MyCustomEventHandler is EventHandler {
  
  // Your custom state
  mapping(address => uint256) public customMetrics;
  
  // Override reaction logic
  function handleEventReaction(
    uint256 subscriptionId,
    address user,
    string memory eventName
  ) external override {
    // Call parent implementation
    super.handleEventReaction(subscriptionId, user, eventName);
    
    // Add custom logic
    if (keccak256(abi.encodePacked(eventName)) == keccak256(abi.encodePacked("MyEvent"))) {
      customMetrics[user]++;
      emit CustomMetricUpdated(user, customMetrics[user]);
    }
  }
}
```

### Method 3: Subscribe to Leaderboard Events

Listen to leaderboard updates without deploying new contracts.

```typescript
// Subscribe in your dApp's frontend
const leaderboardAddress = "0x..."; // LeaderboardRegistry

const listener = await somniaReactivityClient.subscribe({
  address: leaderboardAddress,
  events: ["ScoreUpdated", "AchievementAdded"],
  onData: (event) => {
    // Handle leaderboard changes
    console.log("Player score updated:", event);
    
    // Update your UI
    updatePlayerProfile(event.user, event.newScore);
  }
});

// Clean up when done
await listener.unsubscribe();
```

### Method 4: Bridge to External Systems

Use events to trigger actions in your backend or external services.

```typescript
// Lambda function or serverless handler
export async function handleRewardEvent(event: SomniaReactivityEvent) {
  const { user, amount, reason } = event;
  
  // Send reward notification
  await sendPushNotification(user, `You earned ${amount} tokens: ${reason}`);
  
  // Update your database
  await db.insertRewardLog({
    user,
    amount,
    reason,
    timestamp: new Date(),
  });
  
  // Trigger external action
  if (reason === "Achievement") {
    await awardExternalBadge(user);
  }
}
```

## Use Case Examples

### Example 1: Gaming Platform

```typescript
// Register rules for game events
const slayMonsterRule = await engine.registerRule(
  "MonsterSlain",
  "monsterLevel >= 5",
  ActionType.MINT_REWARD,
  BigInt(100),
  "Monster Hunter",
  "Defeated a level 5+ monster"
);

const pvpVictoryRule = await engine.registerRule(
  "PVPVictory",
  "opponentRank < playerRank",
  ActionType.AWARD_BADGE,
  BigInt(50),
  "PVP Champion",
  "Won against higher-ranked player"
);
```

### Example 2: Educational Platform

```typescript
// Learning achievements
const courseCompletionRule = await engine.registerRule(
  "CourseCompleted",
  "progressScore >= 100",
  ActionType.AWARD_BADGE,
  BigInt(200),
  "Course Graduate",
  "Completed entire course"
);

const perfectScoreRule = await engine.registerRule(
  "PerfectScore",
  "quizScore == 100",
  ActionType.AWARD_BADGE,
  BigInt(50),
  "Perfect Scholar",
  "Achieved perfect quiz score"
);
```

### Example 3: Marketplace

```typescript
// Merchant reputation
const salesRule = await engine.registerRule(
  "Sale",
  "buyerRating >= 4",
  ActionType.UPDATE_SCORE,
  BigInt(10),
  "Trusted Merchant",
  "Consistent high ratings"
);
```

### Example 4: DAO Governance

```typescript
// Governance participation
const proposalVoteRule = await engine.registerRule(
  "ProposalVoted",
  "proposalScore > 0",
  ActionType.AWARD_BADGE,
  BigInt(100),
  "Active Governor",
  "Participated in governance"
);

const proposalPassedRule = await engine.registerRule(
  "ProposalPassed",
  "votesInFavor > quorum",
  ActionType.AWARD_BADGE,
  BigInt(500),
  "Vision Builder",
  "Proposed and passed governance proposal"
);
```

## Frontend Integration Patterns

### Pattern 1: Real-Time Leaderboard

```tsx
// In your React component
import { useSomniaReactivityListener } from '@somnia-reward-engine/hooks';
import { useAppStore } from '@somnia-reward-engine/lib/store';

export function RealtimeLeaderboard() {
  const { leaderboard, setLeaderboard } = useAppStore();
  
  useSomniaReactivityListener(
    undefined,
    undefined,
    (achievement) => {
      // Update leaderboard on achievement
      setLeaderboard(
        leaderboard.map((entry) =>
          entry.address === achievement.user
            ? { ...entry, achievements: entry.achievements + 1 }
            : entry
        )
      );
    }
  );
  
  return (
    <div>
      {leaderboard.map((entry) => (
        <div key={entry.address}>
          <span>{entry.address}</span>
          <span>{entry.score}</span>
          <span>{entry.achievements} badges</span>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 2: Event-Driven Analytics

```tsx
export function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRewards: BigInt(0),
    topEventType: '',
  });
  
  useSomniaReactivityListener(
    (event) => {
      setStats((prev) => ({
        totalEvents: prev.totalEvents + 1,
        totalRewards: prev.totalRewards,
        topEventType: event.eventName,
      }));
    },
    (reward) => {
      setStats((prev) => ({
        ...prev,
        totalRewards: prev.totalRewards + reward.amount,
      }));
    }
  );
  
  return (
    <div>
      <p>Total Events: {stats.totalEvents}</p>
      <p>Total Rewards: {stats.totalRewards.toString()}</p>
      <p>Latest Event: {stats.topEventType}</p>
    </div>
  );
}
```

### Pattern 3: Custom Achievement System

```tsx
export function AchievementTracker({ userAddress }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  useSomniaReactivityListener(
    undefined,
    undefined,
    (achievement) => {
      if (achievement.user === userAddress) {
        setAchievements((prev) => [achievement, ...prev]);
      }
    }
  );
  
  return (
    <div>
      <h2>Your Achievements</h2>
      {achievements.map((ach) => (
        <AchievementCard
          key={ach.id}
          name={ach.name}
          earnedAt={ach.earnedAt}
        />
      ))}
    </div>
  );
}
```

## Type Definitions

```typescript
// Export your own types
export interface CustomEvent {
  eventName: string;
  eventData: {
    playerId: string;
    score: number;
    timestamp: number;
  };
}

export interface CustomRule {
  id: number;
  eventName: string;
  reward: {
    type: 'badge' | 'points' | 'token';
    value: bigint;
  };
}
```

## Environment Setup

```bash
# .env.local for your dApp
NEXT_PUBLIC_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x...
NEXT_PUBLIC_HANDLER_ADDRESS=0x...
NEXT_PUBLIC_SOMNIA_RPC=https://testnet-rpc.somnia.network
```

## API Reference

### Smart Contract Functions

```solidity
// ReactiveRewardEngine
function emitCustomEvent(string eventName, string metadata) external
function registerRule(...) external returns (uint256 ruleId)
function getRule(uint256 ruleId) external view returns (Rule)
function getUserRewards(address user) external view returns (uint256)
function getUserAchievements(address user) external view returns (uint256[])

// LeaderboardRegistry
function registerPlayer(address player) external
function updateScore(address player, uint256 points) external
function awardAchievement(address player, string name, string description) external
function getPlayerStats(address player) external view returns (PlayerStats)
function getPlayerAchievements(address player) external view returns (uint256[])
```

### Frontend Hooks

```typescript
// useSomniaReactivityListener
useSomniaReactivityListener(
  onEventTriggered?: (event) => void,
  onRewardMinted?: (event) => void,
  onAchievementUnlocked?: (event) => void
)

// useSmartContracts
const {
  getRule,
  getUserRewards,
  getUserAchievements,
  emitCustomEvent,
  registerRule,
  isLoading,
  error,
} = useSmartContracts()
```

## Testing Your Integration

```typescript
// Test file
describe('Reward Engine Integration', () => {
  it('should emit event and trigger reaction', async () => {
    // Emit event
    await engine.emitCustomEvent('TestEvent', '{}');
    
    // Wait for reaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify state updated
    const rewards = await engine.getUserRewards(player);
    expect(rewards).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

**Q: Events not being picked up?**
A: Verify EventHandler address is set in ReactiveRewardEngine. Ensure subscription matches event name exactly.

**Q: Rules not executing?**
A: Check that condition is valid. Ensure rule is active (isActive = true).

**Q: Frontend not receiving updates?**
A: Verify Somnia RPC is accessible in env. Check that useSomniaReactivityListener is mounted before events fire.

## Support

- Check [TECHNICAL.md](./TECHNICAL.md) for architecture details
- Review [README.md](./README.md) for overview
- Examine `/contracts` for smart contract implementations
- Look at `/hooks` for frontend integration patterns
