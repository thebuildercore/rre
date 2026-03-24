# Technical Architecture

Deep dive into the Somnia Reactive Reward Engine implementation.

## Contract Specifications

### ReactiveRewardEngine.sol

**Purpose**: Main protocol contract managing rules, events, and reward logic.

#### Data Types

```solidity
enum ActionType {
  MINT_REWARD = 0,      // Mint tokens to user
  AWARD_BADGE = 1,      // Award achievement badge
  UPDATE_SCORE = 2      // Update leaderboard score
}

struct Rule {
  uint256 id;
  string eventName;        // e.g., "SlayMonster"
  string condition;        // e.g., "difficulty >= 1"
  ActionType actionType;
  uint256 rewardAmount;    // Tokens/points to award
  string badgeName;        // Badge name (if AWARD_BADGE)
  string badgeMetadata;    // Badge URI/metadata
  address owner;
  bool isActive;
  uint256 createdAt;
}

struct Event {
  uint256 id;
  address indexed user;
  string eventName;
  string metadata;         // JSON-encoded custom data
  uint256 timestamp;
  bool processed;
}
```

#### Key Functions

**`registerRule(...)`**
- Registers a new reactive rule
- Emits `RuleRegistered` event
- Returns rule ID
- **Accessibility**: Anyone can register (open protocol)

**`emitCustomEvent(eventName, metadata)`**
- User/frontend calls this to trigger an event
- Event is recorded on-chain with timestamp
- Emits `EventTriggered` event that Somnia validators listen for
- **Returns**: Event ID

**`executeAction(user, ruleId)`**
- Called by EventHandler when a rule matches
- Executes the reward logic based on actionType
- Updates state (tokens, badges, scores)
- Emits appropriate events (RewardMinted, AchievementUnlocked, ScoreUpdated)
- **Access**: Only EventHandler can call

#### Events

```solidity
event RuleRegistered(
  uint256 indexed ruleId,
  address indexed owner,
  string eventName,
  uint256 rewardAmount,
  uint256 timestamp
);

event EventTriggered(
  uint256 indexed eventId,
  address indexed user,
  string eventName,
  string metadata,
  uint256 timestamp
);

event RewardMinted(
  address indexed user,
  uint256 amount,
  string reason,
  uint256 timestamp
);

event AchievementUnlocked(
  address indexed user,
  uint256 badgeId,
  string badgeName,
  uint256 timestamp
);

event ScoreUpdated(
  address indexed user,
  uint256 newScore,
  int256 delta,
  uint256 timestamp
);
```

### EventHandler.sol

**Purpose**: Integrates with Somnia Reactivity to automatically trigger rule execution.

#### Key Functions

**`subscribeToRule(ruleId, eventName)`**
- Creates a subscription to a rule
- Returns subscription ID
- In production, this would be called when registering the Somnia subscription via precompile

**`handleEventReaction(subscriptionId, user, eventName)`**
- Simulates Somnia's `_onEvent` callback
- Called when EventTriggered event is detected
- Executes the matching rule via ReactiveRewardEngine.executeAction()
- Emits `RuleExecuted` event

**`processEvent(eventId)`**
- Processes an event by finding matching subscriptions
- Automatically executes all matching rules
- Simulates the push-based behavior

#### Somnia Integration (Production)

In production, EventHandler would inherit from `SomniaEventHandler`:

```solidity
import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts";

contract EventHandler is SomniaEventHandler {
  function _onEvent(
    uint256 subscriptionId,
    address publisher,
    bytes calldata inputs
  ) internal override {
    // Automatically triggered by Somnia validators
    // when EventTriggered event is detected
    
    // Decode inputs and execute rule
    (address user, string memory eventName, ...) = abi.decode(inputs, (...));
    rewardEngine.executeAction(user, subscriptionId);
  }
}
```

### LeaderboardRegistry.sol

**Purpose**: Tracks player scores, ranks, and achievements on-chain.

#### Data Types

```solidity
struct PlayerStats {
  address playerAddress;
  uint256 score;
  uint256 rank;
  uint256 achievementCount;
  uint256 lastScoreUpdate;
  bool isActive;
}

struct Achievement {
  uint256 id;
  string name;
  string description;
  address earnedBy;
  uint256 earnedAt;
}
```

#### Key Functions

**`registerPlayer(address)`**
- Registers a new player (auto-called on first action)
- Initializes PlayerStats

**`updateScore(address, points)`**
- Updates player score
- Auto-registers if not yet registered
- Emits `ScoreUpdated` event
- Triggers leaderboard recomputation

**`awardAchievement(address, name, description)`**
- Awards an achievement badge
- Increments achievement count
- Returns achievement ID

**`getPlayerStats(address)`**
- Returns current player statistics

**`getPlayerAchievements(address)`**
- Returns array of achievement IDs earned by player

## Frontend Integration

### State Management (Zustand)

```typescript
// lib/store.ts
interface AppStore {
  userAddress: `0x${string}` | null;
  currentScore: bigint;
  currentRank: number;
  achievements: Achievement[];
  recentRewards: RewardEvent[];
  leaderboard: LeaderboardEntry[];
  activePipelineEvent: PipelineEvent | null;
  
  // Actions
  setUserAddress(address): void;
  setCurrentScore(score): void;
  setActivePipelineEvent(event): void;
  // ... more actions
}
```

### Hooks

**`useSomniaReactivityListener.ts`**
- Subscribes to push-based event updates from Somnia SDK
- Listens for: EventTriggered, RewardMinted, AchievementUnlocked, ScoreUpdated
- Updates UI in real-time as events are pushed from validators
- Production version uses `@somnia-chain/reactivity-sdk`

**`useSmartContracts.ts`**
- Wrapper around viem for contract calls
- Functions:
  - `getRule(ruleId)` - Read rule data
  - `getUserRewards(address)` - Get user reward balance
  - `getUserAchievements(address)` - Get earned achievements
  - `emitCustomEvent(eventName, metadata)` - Emit event (triggers reaction)
  - `registerRule(data)` - Register new rule

### Components

**`EventPipelineVisualizer.tsx`** (Core showcase)
- Visualizes 6-step reaction flow:
  1. User Action (button click)
  2. Event Emitted (to contract)
  3. SDK Triggered (validators detect)
  4. Condition Checked (rule matching)
  5. Action Executed (reward logic)
  6. State Updated (on-chain update)
- Animates steps in sequence as event progresses
- Shows real data (reward amounts, rank changes)

**`LeaderboardLive.tsx`**
- Displays top 10 players
- Animated score/rank updates
- Highlights current user
- Real-time updates via SDK listener

## Event Flow

### Complete User Action Flow

```
Frontend                     Blockchain                   Validators
-------                      ----------                   ----------

User clicks button
  ↓
emitCustomEvent()
  ├─→ Contract: EventTriggered event emitted
  │   ├─ eventId, user, eventName, timestamp
  │   └─ Stored in events[] mapping
  │
  └─ setActivePipelineEvent(STEP 2)
     (animate "Event Emitted")

[Network broadcasts event]

                            ← Somnia validators detect
                              EventTriggered event
                              via push-based Reactivity
                              (NOT polling!)
                              ↓
                            setActivePipelineEvent(STEP 3)
                            (animate "SDK Triggered")
                            ↓
                            EventHandler._onEvent()
                            called automatically
                            ↓
                            subscriptionId matches rule?
                            YES ✓
                            ↓
                            setActivePipelineEvent(STEP 4)
                            (animate "Condition Checked")
                            ↓
                            executeAction(user, ruleId)
                            ├─ _mintReward() or
                            ├─ _awardBadge() or
                            └─ _updateScore()
                            ↓
                            setActivePipelineEvent(STEP 5)
                            (animate "Action Executed")
                            ↓
                            LeaderboardRegistry.updateScore()
                            ↓
                            Emit:
                            - RewardMinted
                            - AchievementUnlocked
                            - ScoreUpdated
                            ↓
                            setActivePipelineEvent(STEP 6)
                            (animate "State Updated")

← Somnia Reactivity SDK
  PUSHES updates to
  connected frontend
  (sub-second latency)
  ↓
useSomniaReactivityListener
receives event update
  ↓
Frontend updates:
- User score
- User rank
- Leaderboard
- Achievement count
  ↓
UI animations trigger:
- Reward drop-in
- Rank jump highlight
- Badge pop-up
- Toast notification
```

## Gas Efficiency

### Optimizations

1. **Event-based state** - Use events instead of storage for leaderboard history
2. **Lazy leaderboard** - Recompute only on demand, not on every score update
3. **Batched operations** - Group multiple updates in single transaction
4. **Immutable structs** - Use value types where possible

### Gas Estimates (approximate)

| Operation | Gas | Notes |
|-----------|-----|-------|
| emitCustomEvent | 50k | Create event, emit |
| registerRule | 80k | Store rule, emit |
| executeAction (mint) | 120k | Update balance, emit |
| updateScore | 60k | Update leaderboard |
| registerPlayer | 40k | Initialize stats |

## Security Considerations

### Assumptions

1. **Somnia validators are honest** - Reactivity triggers are trusted
2. **No reentrancy** - Single-transaction actions, no callbacks
3. **EventHandler authorization** - Only approved address can execute

### Recommendations for Production

1. **Add access control** - Implement role-based permissions
2. **Rate limiting** - Prevent spam events (max N events per user per block)
3. **Safe math** - Use checked arithmetic for score calculations
4. **Pausable rules** - Admin can disable malicious rules
5. **Event verification** - Cryptographic proof of event origin (if needed)

## Deployment Checklist

- [ ] Compile contracts with `npx hardhat compile`
- [ ] Run tests: `npx hardhat test`
- [ ] Deploy to testnet: `npx hardhat run scripts/deploy.ts --network somnia-testnet`
- [ ] Verify contracts on explorer
- [ ] Create Somnia Reactivity subscription via precompile
- [ ] Seed initial rules with `scripts/seed-rules.ts`
- [ ] Test end-to-end: emit event → verify reaction fires
- [ ] Deploy frontend to Vercel

## Performance Metrics

### On-Chain

- **Block time**: ~2 seconds (Somnia testnet)
- **Reaction latency**: ~4-6 seconds (2-3 blocks for confirmation)
- **Transaction cost**: ~120k gas for reward execution (~0.024 SOMI at 200 gwei)

### Frontend

- **Push latency**: ~1-2 seconds from on-chain execution
- **Animation duration**: ~3.6 seconds (6 steps × 0.6s)
- **Leaderboard update**: <100ms after push received

## Debugging

### Enable Logging

```typescript
// In contracts
console.log("Event triggered:", eventName, user);

// In frontend
console.log("[useSomniaReactivityListener]", event);
```

### Common Issues

**Q: Events not triggering reactions?**
A: Check that EventHandler is set in ReactiveRewardEngine. Verify subscription matches event name exactly.

**Q: Leaderboard not updating?**
A: Ensure LeaderboardRegistry address is set in ReactiveRewardEngine. Check that updateScore is called after reward execution.

**Q: Frontend not receiving updates?**
A: Verify Somnia RPC is accessible. Check that useSomniaReactivityListener is mounted. In MVP, may need to manually trigger processEvent for demo.

## References

- [Somnia Reactivity Docs](https://docs.somnia.network/developer/reactivity)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Next.js 16 Docs](https://nextjs.org/docs)
