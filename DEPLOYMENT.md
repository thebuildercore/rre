# Deployment Guide

Deploy the Somnia Reactive Reward Engine to Somnia Testnet and Mainnet.

## Prerequisites

- Node.js 18+
- pnpm
- Private key for deployment wallet with SOMI tokens (testnet or mainnet)
- Hardhat configured for Somnia

## Hardhat Configuration

Create or update `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    "somnia-testnet": {
      url: "https://testnet-rpc.somnia.network",
      accounts: [process.env.PRIVATE_KEY || "0x"],
      chainId: 1001,
    },
    "somnia-mainnet": {
      url: "https://rpc.somnia.network",
      accounts: [process.env.PRIVATE_KEY || "0x"],
      chainId: 314159,
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;
```

## Environment Setup

### Create `.env` file

```bash
cp .env.local.example .env
```

### Add to `.env`:

```
# Deployment wallet
PRIVATE_KEY=0x... (your private key, keep secret!)

# RPC endpoints (public, no secrets)
SOMNIA_TESTNET_RPC=https://testnet-rpc.somnia.network
SOMNIA_MAINNET_RPC=https://rpc.somnia.network

# Verification (optional, for etherscan-style explorers)
SOMNIA_EXPLORER_API_KEY=...
```

### Security Note
- **Never** commit `.env` to git
- Add `.env` to `.gitignore`
- Use environment variables in CI/CD

## Step 1: Compile Contracts

```bash
npx hardhat compile
```

This generates ABI files in `artifacts/contracts/`.

## Step 2: Deploy to Testnet

```bash
npx hardhat run scripts/deploy.ts --network somnia-testnet
```

**Output:**
```
Deploying Somnia Reactive Reward Engine...

1. Deploying LeaderboardRegistry...
   ✓ LeaderboardRegistry: 0x1234...

2. Deploying ReactiveRewardEngine...
   ✓ ReactiveRewardEngine: 0x5678...

3. Deploying EventHandler...
   ✓ EventHandler: 0xabcd...

4. Linking contracts...
   ✓ ReactiveRewardEngine.setEventHandler(0xabcd...)
   ✓ LeaderboardRegistry.setRewardEngine(0x5678...)

=== Deployment Complete ===

Contract Addresses:
{
  "leaderboard": "0x1234...",
  "engine": "0x5678...",
  "handler": "0xabcd...",
  "timestamp": "2026-03-24T..."
}

Save these addresses to .env.local:
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x1234...
NEXT_PUBLIC_ENGINE_ADDRESS=0x5678...
NEXT_PUBLIC_HANDLER_ADDRESS=0xabcd...
```

## Step 3: Update Environment

Copy contract addresses to `.env.local`:

```
NEXT_PUBLIC_ENGINE_ADDRESS=0x5678...
NEXT_PUBLIC_HANDLER_ADDRESS=0xabcd...
NEXT_PUBLIC_LEADERBOARD_ADDRESS=0x1234...
NEXT_PUBLIC_SOMNIA_RPC=https://testnet-rpc.somnia.network
NEXT_PUBLIC_DEMO_MODE=false
```

## Step 4: Seed Initial Rules

```bash
npx hardhat run scripts/seed-rules.ts --network somnia-testnet
```

**Output:**
```
Seeding default rules...

1. Registering 'Slay Monster' rule...
   ✓ Rule ID 0: SlayMonster → +50 tokens

2. Registering 'Complete Workout' rule...
   ✓ Rule ID 1: CompleteWorkout → Fitness Master badge + 30 points

3. Registering 'Meditation Session' rule...
   ✓ Rule ID 2: MeditationSession → +20 points

=== Seeding Complete ===

Default rules registered:
  - Rule 0: SlayMonster → +50 tokens
  - Rule 1: CompleteWorkout → Fitness Master badge + 30 points
  - Rule 2: MeditationSession → +20 points
```

## Step 5: Test Contracts

### Local Testing

```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy to local network
npx hardhat run scripts/deploy.ts --network localhost

# Run tests
npx hardhat test
```

### Testnet Testing

After deployment to testnet:

```typescript
// Manual verification script
const engine = await ethers.getContractAt(
  "ReactiveRewardEngine",
  "0x5678..."
);

// Verify rule was registered
const rule = await engine.getRule(0);
console.log("Rule 0:", rule);
// Output: { id: 0, eventName: "SlayMonster", ... }

// Emit a test event
const tx = await engine.emitCustomEvent("SlayMonster", "{}");
const receipt = await tx.wait();
console.log("Event emitted, txHash:", receipt.transactionHash);
```

## Step 6: Deploy Frontend

### Option A: Vercel (Recommended)

```bash
# Connect to Vercel
vercel link

# Deploy
vercel deploy --prod
```

### Option B: Netlify

```bash
# Build
pnpm build

# Deploy (using Netlify UI or CLI)
netlify deploy --prod --dir=.next
```

### Option C: Self-Hosted

```bash
# Build production bundle
pnpm build

# Start server
pnpm start
```

## Step 7: Create Somnia Reactivity Subscription

This is the key integration step that enables push-based reactions.

### Via Contract (Hardhat)

```typescript
// scripts/setup-subscription.ts
async function main() {
  const [deployer] = await ethers.getSigners();
  
  // In production, call Somnia's reactivity precompile
  // This example shows the concept
  
  const eventHandler = await ethers.getContractAt(
    "EventHandler",
    HANDLER_ADDRESS
  );
  
  // Subscribe to rules
  for (let i = 0; i < 3; i++) {
    const rule = await engine.getRule(i);
    const subscriptionId = await eventHandler.subscribeToRule(
      i,
      rule.eventName
    );
    console.log(`Subscription ${subscriptionId} created for rule ${i}`);
  }
}

main();
```

Run with:
```bash
npx hardhat run scripts/setup-subscription.ts --network somnia-testnet
```

## Step 8: Verify Deployment

### Check Contract Addresses

```bash
# Visit Somnia Explorer
# Testnet: https://testnet-explorer.somnia.network
# Mainnet: https://explorer.somnia.network

# Paste contract addresses to verify
# - LeaderboardRegistry: 0x1234...
# - ReactiveRewardEngine: 0x5678...
# - EventHandler: 0xabcd...
```

### Test via Frontend

1. Update `.env.local` with deployed addresses
2. Start frontend: `pnpm dev`
3. Click "Slay Monster" button
4. Check if:
   - Event is emitted on-chain (visible in explorer)
   - LeaderboardRegistry is updated (query via explorer or contract)
   - EventPipelineVisualizer animates correctly

## Deploying to Mainnet

**Prerequisites:**
- Testnet deployment verified working
- Mainnet SOMI tokens for gas
- Mainnet RPC configured

### Steps:

1. **Update hardhat config** to include mainnet
2. **Set mainnet RPC** in `.env`
3. **Deploy to mainnet**:
   ```bash
   npx hardhat run scripts/deploy.ts --network somnia-mainnet
   ```
4. **Save addresses** to production `.env`
5. **Seed production rules**:
   ```bash
   npx hardhat run scripts/seed-rules.ts --network somnia-mainnet
   ```
6. **Deploy frontend** with mainnet addresses
7. **Monitor** via Somnia Explorer (mainnet)

## Monitoring & Maintenance

### Check Contract State

```typescript
// Verify rules are active
const rule0 = await engine.getRule(0);
console.log("Rule 0 active:", rule0.isActive);

// Check user stats
const userRewards = await engine.getUserRewards(userAddress);
console.log("User rewards:", userRewards);

// Get leaderboard
const stats = await leaderboard.getPlayerStats(userAddress);
console.log("Player stats:", stats);
```

### Monitor Transactions

- Testnet: https://testnet-explorer.somnia.network
- Mainnet: https://explorer.somnia.network

### Logs & Debugging

```bash
# Enable verbose logging
DEBUG=ethers:* npx hardhat run scripts/deploy.ts --network somnia-testnet

# View past transactions
npx hardhat verify --network somnia-testnet 0x...
```

## Cost Estimates

### Testnet (No Cost)
- Gas from testnet faucet (free SOMI)
- All contracts deployable for testing

### Mainnet
- LeaderboardRegistry: ~80k gas
- ReactiveRewardEngine: ~100k gas  
- EventHandler: ~70k gas
- **Total: ~250k gas (~0.05 SOMI at 200 gwei)**

### Transaction Costs
- emitCustomEvent: ~50k gas (~0.01 SOMI)
- executeAction: ~120k gas (~0.024 SOMI)
- registerRule: ~80k gas (~0.016 SOMI)

## Troubleshooting

**Q: Private key error?**
A: Set `PRIVATE_KEY` env var. Ensure account has SOMI for gas.

**Q: Contract deployment fails?**
A: Check RPC is accessible. Verify Solidity version matches hardhat config.

**Q: Events not triggering reactions?**
A: Ensure EventHandler is set in ReactiveRewardEngine. Create Somnia subscription.

**Q: Frontend showing old addresses?**
A: Clear `.env.local` cache. Restart dev server with new addresses.

## Post-Deployment Checklist

- [ ] Contracts deployed to testnet/mainnet
- [ ] Contract addresses saved to `.env.local`
- [ ] Rules seeded via `seed-rules.ts`
- [ ] Frontend deployed with correct addresses
- [ ] Somnia Reactivity subscription created
- [ ] Test action emitted and reaction triggered
- [ ] Leaderboard updated on-chain
- [ ] Frontend received push update (no polling!)
- [ ] Production monitoring set up
- [ ] Documentation updated with live addresses

## Next Steps

1. **Create governance** - Allow community to register rules
2. **Add analytics** - Track reaction statistics
3. **Optimize gas** - Further reduce transaction costs
4. **Scale leaderboard** - Use indexed storage for large datasets
5. **Multi-chain** - Deploy to other networks

## Support

- 📖 `README.md` - Full documentation
- 🔧 `TECHNICAL.md` - Architecture details
- 🚀 `QUICKSTART.md` - Get running fast

---

**Ready to deploy?**

```bash
npx hardhat run scripts/deploy.ts --network somnia-testnet
```
