# Quick Start Guide

Get the Somnia Reactive Reward Engine running in 5 minutes.

## Prerequisites

- Node.js 18+ 
- pnpm (or npm)
- Browser wallet (MetaMask/Rainbow)

## 1. Install Dependencies (1 minute)

```bash
pnpm install
```

## 2. Set Up Environment (1 minute)

```bash
cp .env.local.example .env.local

# Edit .env.local with:
NEXT_PUBLIC_SOMNIA_RPC="https://testnet-rpc.somnia.network"
NEXT_PUBLIC_DEMO_MODE="true"  # Start in demo mode (no wallet required)
```

## 3. Start Frontend (1 minute)

```bash
pnpm dev
```

Visit **http://localhost:3000**

## 4. Try the Demo (2 minutes)

You'll see:

- **Left Panel:**
  - Your profile (score, rank, achievements)
  - 3 action buttons (Slay Monster, Complete Workout, Meditation)
  - Rule builder form
  
- **Right Panel:**
  - **EventPipelineVisualizer** - The showcase! Click a button and watch the 6-step reaction pipeline animate
  - Leaderboard with animated rank/score updates

### Actions to Try:
1. Click **"Slay Monster"** → Watch pipeline animate → See +50 points awarded
2. Click **"Complete Workout"** → See Fitness Master badge awarded
3. Create a **Custom Rule** → Register your own reward trigger

## Deploy to Somnia (Optional, for production)

### Step 1: Compile Contracts
```bash
npx hardhat compile
```

### Step 2: Deploy to Testnet
```bash
npx hardhat run scripts/deploy.ts --network somnia-testnet
```

This outputs contract addresses. Copy them to `.env.local`:
```
NEXT_PUBLIC_ENGINE_ADDRESS=0x...
NEXT_PUBLIC_HANDLER_ADDRESS=0x...
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x...
```

### Step 3: Seed Rules
```bash
npx hardhat run scripts/seed-rules.ts --network somnia-testnet
```

### Step 4: Turn Off Demo Mode
```
NEXT_PUBLIC_DEMO_MODE="false"
```

## File Structure

```
├── contracts/                    # Smart contracts
│   ├── ReactiveRewardEngine.sol
│   ├── EventHandler.sol
│   └── LeaderboardRegistry.sol
│
├── app/
│   ├── page.tsx                 # Main page (split view)
│   └── layout.tsx
│
├── components/
│   ├── Arena/                   # Left panel
│   │   ├── ActionButton.tsx
│   │   └── UserProfile.tsx
│   ├── RuleBuilder/             # Left panel
│   │   └── RuleForm.tsx
│   └── LiveDashboard/           # Right panel
│       ├── EventPipelineVisualizer.tsx  # THE SHOWCASE
│       ├── LeaderboardLive.tsx
│       └── RewardNotification.tsx
│
├── hooks/
│   ├── useSomniaReactivityListener.ts   # Push-based updates
│   └── useSmartContracts.ts             # Contract calls
│
├── lib/
│   ├── store.ts                 # Zustand state
│   ├── types.ts                 # TypeScript types
│   ├── constants.ts             # ABIs & addresses
│   └── animations.ts            # Framer Motion
│
└── scripts/
    ├── deploy.ts
    └── seed-rules.ts
```

## Key Features to Explore

### EventPipelineVisualizer (The Showcase)
- Shows exact 6-step Reactivity flow
- Animates in real-time
- Demonstrates push-based paradigm

### RuleForm (Visual Builder)
- Create rules: When [event] → Then [action]
- Pre-configured templates
- Custom event support

### LeaderboardLive (Animated Updates)
- Top 10 players
- Real-time score updates
- Rank animations

## Troubleshooting

**Q: Button clicks not working?**
A: Make sure `NEXT_PUBLIC_DEMO_MODE="true"` in `.env.local`

**Q: Pipeline not animating?**
A: Check browser console (F12) for errors. Ensure JavaScript is enabled.

**Q: Want to deploy to Somnia?**
A: See "Deploy to Somnia" section above or read `TECHNICAL.md`

## What's Happening Under the Hood

When you click "Slay Monster":

1. Frontend calls `emitCustomEvent("SlayMonster")`
2. Event is recorded on-chain
3. Somnia validators detect event via PUSH (not polling!)
4. EventHandler automatically executes rule
5. Reward minted, leaderboard updated
6. SDK pushes update to frontend (real-time!)
7. EventPipelineVisualizer animates all steps

**All of this happens in ~4 seconds on testnet. Zero polling. Zero keepers. Pure push-based Reactivity.**

## Next Steps

1. **Read**: Check out `README.md` for full overview
2. **Integrate**: See `INTEGRATION.md` to add to your dApp
3. **Deploy**: Use `TECHNICAL.md` for mainnet deployment
4. **Extend**: Modify rules, add custom events, customize rewards

## Support

- 📖 `README.md` - Full documentation
- 🔧 `TECHNICAL.md` - Architecture & specs
- 🔗 `INTEGRATION.md` - How to use in your dApp
- 📝 `BUILD_SUMMARY.md` - What was built & why

---

**Ready to see push-based Reactivity in action?** 

```bash
pnpm dev
```

Visit http://localhost:3000 and click "Slay Monster" to watch the magic happen.
