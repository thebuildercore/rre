# Somnia Reactive Reward Engine

A next-generation **push-based reactive reward protocol** powered by Somnia Network's Reactivity SDK. Turn any on-chain event into instant, trustless rewards, leaderboard updates, and achievement badges — with **zero polling, zero keepers, and zero external infrastructure**.

## 🎯 Core Innovation

Traditional blockchain systems use:
- **Polling**: Servers constantly asking "Did something happen?" ❌ Slow, expensive, centralized
- **Keepers**: External jobs checking conditions ❌ Trust assumptions, operational overhead
- **Indexers**: Separate databases to track state ❌ More infrastructure, more failure points

**Somnia Reactivity Engine** uses:
- **Push-based reactions**: Validators automatically trigger actions when conditions match ✅ Sub-second latency
- **On-chain subscriptions**: Rules registered and executed entirely on Somnia ✅ Fully trustless
- **Real-time frontend**: SDK listeners receive updates the moment reactions fire ✅ True live updates

## 🏗️ Architecture

### Smart Contracts (Solidity)

```
ReactiveRewardEngine.sol (Main Protocol)
  ├─ registerRule(eventName, condition, actionType, ...) → Register rules
  ├─ emitCustomEvent(eventName, metadata) → Emit events
  └─ executeAction(user, ruleId) → Called by EventHandler to execute rewards

EventHandler.sol (Somnia Reactivity Integration)
  ├─ subscribeToRule(ruleId, eventName) → Create subscriptions
  ├─ handleEventReaction(...) → Triggered on-chain by Somnia validators
  └─ processEvent(eventId) → Process events (simulates push for MVP)

LeaderboardRegistry.sol (On-Chain State)
  ├─ registerPlayer(address)
  ├─ updateScore(address, points)
  ├─ awardAchievement(address, name, description)
  └─ getPlayerStats(address) → Retrieve player state
```

### Frontend Architecture

```
app/page.tsx (Main Split-View Layout)
  ├─ Left Panel:
  │   ├─ UserProfile (score, rank, achievements)
  │   ├─ Arena/Quest View (action buttons)
  │   └─ RuleBuilder (visual rule creator)
  │
  └─ Right Panel:
      ├─ EventPipelineVisualizer (6-step Reactivity flow)
      ├─ LeaderboardLive (top 10, animated updates)
      └─ RewardNotification (toast notifications)

Hooks:
  ├─ useSomniaReactivityListener.ts (push-based event listening)
  ├─ useSmartContracts.ts (contract interactions)
  └─ useAppStore (Zustand state management)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- Solidity compiler (for contract compilation)

### Installation

```bash
# Clone and install dependencies
pnpm install

# Set up environment
cp .env.local.example .env.local

# Add contract addresses from deployment to .env.local
NEXT_PUBLIC_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_HANDLER_ADDRESS=0x...
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x...
```

### Deploy Contracts (Somnia Testnet)

```bash
# Compile contracts
npx hardhat compile

# Deploy to Somnia testnet
npx hardhat run scripts/deploy.ts --network somnia-testnet

# Seed default rules
npx hardhat run scripts/seed-rules.ts --network somnia-testnet
```

### Run Frontend

```bash
# Development
pnpm dev

# Open http://localhost:3000
```

## 📊 How It Works

### User Action Flow

```
1. User clicks "Slay Monster" button
   ↓
2. Frontend calls: ReactiveRewardEngine.emitCustomEvent("SlayMonster", "metadata")
   ↓
3. Event is emitted on-chain → blockchain records it
   ↓
4. Somnia validators detect event via push (not polling!)
   ↓
5. EventHandler automatically calls executeAction("SlayMonster", rules)
   ↓
6. On-chain: Reward tokens minted, leaderboard updated, achievement awarded
   ↓
7. Frontend receives update via Somnia Reactivity SDK listener (push, not polling!)
   ↓
8. EventPipelineVisualizer animates all 6 steps in real-time
   ↓
9. LeaderboardLive updates with new scores/ranks
```

### The 6-Step Pipeline (Visualized in Real-Time)

1. **User Action** 👆 - User clicks an action button
2. **Event Emitted** 📤 - Event sent to ReactiveRewardEngine on-chain
3. **SDK Triggered** ⚡ - Somnia validators detect via push-based Reactivity
4. **Condition Checked** ✓ - Rule conditions validated on-chain
5. **Action Executed** 🎯 - Reward logic runs instantly (no external keeper)
6. **State Updated** 🎉 - Leaderboard/achievements updated, frontend notified

## 📋 Rule Registration

Users can create custom rules via the visual rule builder:

```
Event: "SlayMonster"
Condition: "difficulty >= 1"
Action: Mint Reward
Reward: 50 tokens
```

Or programmatically:

```typescript
const ruleId = await engine.registerRule(
  "SlayMonster",        // eventName
  "difficulty >= 1",    // condition
  ActionType.MINT_REWARD, // actionType
  BigInt(50e18),        // rewardAmount
  "",                   // badgeName
  ""                    // badgeMetadata
);
```

## 🔄 Real-Time Updates (Push, Not Polling)

### Frontend Listening via Somnia SDK

```typescript
import { useSomniaReactivityListener } from '@/hooks/useSomniaReactivityListener';

export function Dashboard() {
  useSomniaReactivityListener(
    (event) => {
      // Triggered when EventTriggered event is detected
      console.log('Event fired:', event.eventName);
      // Animate pipeline, update leaderboard
    },
    (reward) => {
      // Triggered when RewardMinted event is detected
      console.log('Reward:', reward.amount);
    },
    (achievement) => {
      // Triggered when AchievementUnlocked event is detected
      console.log('Achievement:', achievement.badgeName);
    }
  );
}
```

**Why push-based matters:**
- ✅ **No polling delays** - Events arrive instantly as validators confirm them
- ✅ **Scalable** - Only sends updates when something actually changes
- ✅ **Efficient** - No wasted network calls checking for updates
- ✅ **True real-time** - Leaderboard updates within 1-2 seconds of on-chain execution

## 🧩 Modularity: Using This Engine in Other dApps

Your ReactiveRewardEngine is designed to be **reusable and composable**. Other dApps can:

### Option 1: Inherit EventHandler

```solidity
import { EventHandler } from "./contracts/EventHandler.sol";

contract MyCustomHandler is EventHandler {
  function customLogic(address user) internal override {
    // Your custom logic here
  }
}
```

### Option 2: Subscribe to Events

```typescript
// In another dApp's frontend
const leaderboardAddress = "0x..."; // Your deployed LeaderboardRegistry

const listener = await somniaReactivityClient.subscribe({
  address: leaderboardAddress,
  events: ["ScoreUpdated", "AchievementUnlocked"],
  onData: (event) => {
    // Update your UI with leaderboard changes
    updateMyDashboard(event);
  }
});
```

### Option 3: Call Reward Engine

```typescript
// Register your own rule in another dApp
const ruleId = await engine.registerRule(
  "MyCustomEvent",
  "myCondition",
  ActionType.UPDATE_SCORE,
  BigInt(100e18),
  "Custom Badge",
  "Earned in MyDApp"
);
```

## 🎮 Demo Features

The included demo showcases:

- **Arena View**: "Slay Monster", "Complete Workout", "Meditation" action buttons
- **Live Reactivity Dashboard**: Real-time 6-step pipeline visualizer
- **Leaderboard**: Top 10 players with animated rank/score updates
- **Rule Builder**: Visual form to create custom reward rules
- **Push-Based Updates**: All events pushed from validators (simulated in MVP)

## 🧪 Testing

```bash
# Run contract tests
npx hardhat test

# Deploy to local testnet
npx hardhat node

# In another terminal
npx hardhat run scripts/deploy.ts --network localhost
```

## 🔧 Tech Stack

**Smart Contracts:**
- Solidity ^0.8.20
- Hardhat (compilation & deployment)
- OpenZeppelin (optional, for standard contracts)

**Frontend:**
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS v4
- shadcn/ui (component library)
- Framer Motion (animations)
- Zustand (state management)
- viem (contract interactions)
- wagmi (optional, for wallet integration)

## 📈 Success Metrics

✅ **Zero External Infrastructure** - All state on-chain, no databases or indexers
✅ **Sub-Second Reactions** - EventHandler executes within 1-2 blocks (~2 seconds on testnet)
✅ **Push-Based Updates** - Frontend receives updates via SDK listeners, not polling
✅ **Fully Trustless** - No keepers, no external servers, all logic verifiable on-chain
✅ **Modular Protocol** - Other dApps can inherit/integrate without modification
✅ **Visual Showcase** - EventPipelineVisualizer demonstrates exact flow with animations

## 🎯 Next Steps

1. **Deploy to Somnia Mainnet** - Move from testnet to production
2. **Add More Reaction Types** - Extend beyond rewards (airdrops, governance, etc.)
3. **NFT Badge System** - Integrate full ERC721 badges with metadata
4. **Cross-Chain Bridge** - Use Somnia for reactions triggered by other chains
5. **Analytics Dashboard** - Track reaction statistics, popular rules, etc.

## 📖 Architecture Documentation

See `TECHNICAL.md` for detailed architecture, function signatures, and event specifications.

## 🤝 Integration Support

To integrate this engine into your dApp:

1. Deploy contracts to Somnia testnet
2. Copy contract ABIs from `lib/constants.ts`
3. Use `useSmartContracts` hook for contract calls
4. Use `useSomniaReactivityListener` hook for real-time updates
5. Customize `EventHandler.sol` for your specific logic

## 📝 License

MIT

## 🙌 Built on Somnia Network

Powered by **Somnia Reactivity** - The protocol that makes on-chain automation instant, trustless, and scalable.

---

**Questions?** Check the [Somnia Docs](https://docs.somnia.network) or examine the contracts in `/contracts` and hooks in `/hooks`.
