# Deployment Guide

Deploy the Somnia Reactive Reward Engine to Somnia Testnet and Mainnet.

## Prerequisites

- Node.js 18+
- pnpm
- Private key for deployment wallet with SOMI tokens (testnet or mainnet)
- Hardhat configured for Somnia

## Hardhat Configuration

## current deployment 25-03-2026
 Deploying Somnia Reactive System...

1️ Deploying LeaderboardRegistry...
   ✅ LeaderboardRegistry deployed at: 0x9caDEF56D6d8E2371035A1E743E7e54Fdfc77B90

2️ Deploying ReactiveRewardEngine...
   ✅ ReactiveRewardEngine deployed at: 0x045Cb861913851b06F37c212C1da5d36193511f0

3️ Deploying EventHandler...
   ✅ EventHandler deployed at: 0x0414F325a014A327E623712214EBEAC2Eb9cdDB1

4️ Linking contracts...
    Engine → Handler linked
    Leaderboard → Engine linked

 === Deployment Complete ===

 Contract Addresses:
{
  "leaderboard": "0x9caDEF56D6d8E2371035A1E743E7e54Fdfc77B90",
  "engine": "0x045Cb861913851b06F37c212C1da5d36193511f0",
  "handler": "0x0414F325a014A327E623712214EBEAC2Eb9cdDB1"
}

 Next Steps:
1. Create rules in ReactiveRewardEngine
2. Subscribe via EventHandler
3. Trigger using processReactionPush()
akshaya@LAPTOP-7AG4UK0V:~/rre$ 


### Deploying Somnia Reactive Reward Engine...

  ✓ LeaderboardRegistry: 0xB510b1A90Fc3A34d1B464D69ad94448de7924ab5
  ✓ ReactiveRewardEngine: 0x0C6E2eB7c8761D5103F744E09c832c68cCBd10f9
  ✓ EventHandler: 0xE474A6F728F8eE2D22a686eC52135d21b7AD99Bd

4. Linking contracts...
  ✓ ReactiveRewardEngine.setEventHandler(0xE474A6F728F8eE2D22a686eC52135d21b7AD99Bd)
  ✓ LeaderboardRegistry.setRewardEngine(0x0C6E2eB7c8761D5103F744E09c832c68cCBd10f9)

=== Deployment Complete ===

Contract Addresses:
{
  "leaderboard": "0xB510b1A90Fc3A34d1B464D69ad94448de7924ab5",
  "engine": "0x0C6E2eB7c8761D5103F744E09c832c68cCBd10f9",
  "handler": "0xE474A6F728F8eE2D22a686eC52135d21b7AD99Bd"
}
akshaya@LAPTOP-7AG4UK0V:~/rre$ 
### deployed ✓ LeaderboardRegistry: 0x21D7912FF655a28B185d183b5c7F2DD310ac410D


