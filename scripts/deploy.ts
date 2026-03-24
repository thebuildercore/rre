import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Somnia Reactive Reward Engine...\n");

  // 1. Deploy Leaderboard
  const Leaderboard = await ethers.getContractFactory("LeaderboardRegistry");
  const leaderboard = await Leaderboard.deploy();
  await leaderboard.waitForDeployment();
  const leaderboardAddr = await leaderboard.getAddress();
  console.log(`  ✓ LeaderboardRegistry: ${leaderboardAddr}`);

  // 2. Deploy Engine
  const Engine = await ethers.getContractFactory("ReactiveRewardEngine");
  const engine = await Engine.deploy(leaderboardAddr);
  await engine.waitForDeployment();
  const engineAddr = await engine.getAddress();
  console.log(`  ✓ ReactiveRewardEngine: ${engineAddr}`);

  // 3. Deploy EventHandler
  const Handler = await ethers.getContractFactory("EventHandler");
  const handler = await Handler.deploy(engineAddr);
  await handler.waitForDeployment();
  const handlerAddr = await handler.getAddress();
  console.log(`  ✓ EventHandler: ${handlerAddr}`);

  // 4. Link Contracts Together
  console.log("\n4. Linking contracts...");
  await engine.setEventHandler(handlerAddr);
  console.log(`  ✓ ReactiveRewardEngine.setEventHandler(${handlerAddr})`);
  
  await leaderboard.setRewardEngine(engineAddr);
  console.log(`  ✓ LeaderboardRegistry.setRewardEngine(${engineAddr})`);

  console.log("\n=== Deployment Complete ===\n");
  console.log("Contract Addresses:");
  console.log(JSON.stringify({
    leaderboard: leaderboardAddr,
    engine: engineAddr,
    handler: handlerAddr,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});