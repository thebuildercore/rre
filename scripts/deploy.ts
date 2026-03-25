import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("\n🚀 Deploying Somnia Reactive System...\n");

  // ========== CONFIG ==========
  // If you already deployed Leaderboard, paste address here
  const EXISTING_LEADERBOARD = null; 
  // Example: "0x1234..." or keep null to deploy new

  let leaderboardAddr;

  // ========== 1. Leaderboard ==========
  if (EXISTING_LEADERBOARD) {
    leaderboardAddr = EXISTING_LEADERBOARD;
    console.log(`📦 Using existing LeaderboardRegistry: ${leaderboardAddr}`);
  } else {
    console.log("1️⃣ Deploying LeaderboardRegistry...");
    const Leaderboard = await ethers.getContractFactory("LeaderboardRegistry");
    const leaderboard = await Leaderboard.deploy();
    await leaderboard.waitForDeployment();

    leaderboardAddr = await leaderboard.getAddress();
    console.log(`   ✅ LeaderboardRegistry deployed at: ${leaderboardAddr}`);
  }

  // ========== 2. ReactiveRewardEngine ==========
  console.log("\n2️⃣ Deploying ReactiveRewardEngine...");
  const Engine = await ethers.getContractFactory("ReactiveRewardEngine");
  const engine = await Engine.deploy(); // no constructor args
  await engine.waitForDeployment();

  const engineAddr = await engine.getAddress();
  console.log(`   ✅ ReactiveRewardEngine deployed at: ${engineAddr}`);

  // ========== 3. EventHandler ==========
  console.log("\n3️⃣ Deploying EventHandler...");
  const Handler = await ethers.getContractFactory("EventHandler");
  const handler = await Handler.deploy(engineAddr);
  await handler.waitForDeployment();

  const handlerAddr = await handler.getAddress();
  console.log(`   ✅ EventHandler deployed at: ${handlerAddr}`);

  // ========== 4. Linking ==========
  console.log("\n4️⃣ Linking contracts...");

  // Link handler -> engine
  try {
    const tx1 = await engine.setEventHandler(handlerAddr);
    await tx1.wait();
    console.log(`   🔗 Engine → Handler linked`);
  } catch (err) {
    console.log("   ⚠️ Failed to link EventHandler in Engine");
    console.log(err.message);
  }

  // Link engine -> leaderboard (optional)
  try {
    const leaderboard = await ethers.getContractAt(
      "LeaderboardRegistry",
      leaderboardAddr
    );

    const tx2 = await leaderboard.setRewardEngine(engineAddr);
    await tx2.wait();

    console.log(`   🔗 Leaderboard → Engine linked`);
  } catch (err) {
    console.log("   ⚠️ Leaderboard linking skipped or not supported");
  }

  // ========== DONE ==========
  console.log("\n🎉 === Deployment Complete ===\n");

  const result = {
    leaderboard: leaderboardAddr,
    engine: engineAddr,
    handler: handlerAddr,
  };

  console.log("📌 Contract Addresses:");
  console.log(JSON.stringify(result, null, 2));

  console.log("\n👉 Next Steps:");
  console.log("1. Create rules in ReactiveRewardEngine");
  console.log("2. Subscribe via EventHandler");
  console.log("3. Trigger using processReactionPush()");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:\n", error);
  process.exitCode = 1;
});