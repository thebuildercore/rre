/**
 * Seed default rules for demo
 * Creates 3 example rules: Slay Monster, Complete Workout, Meditation
 * 
 * Usage: npx hardhat run scripts/seed-rules.ts --network somnia-testnet
 */

async function main() {
  const ENGINE_ADDRESS = process.env.NEXT_PUBLIC_ENGINE_ADDRESS;
  
  if (!ENGINE_ADDRESS) {
    console.error("ERROR: NEXT_PUBLIC_ENGINE_ADDRESS not set");
    process.exit(1);
  }

  console.log("Seeding default rules...\n");
  
  const ReactiveRewardEngine = await ethers.getContractFactory("ReactiveRewardEngine");
  const engine = ReactiveRewardEngine.attach(ENGINE_ADDRESS);

  // Enum ActionType: 0 = MINT_REWARD, 1 = AWARD_BADGE, 2 = UPDATE_SCORE

  // Rule 1: Slay Monster → Mint 50 reward tokens
  console.log("1. Registering 'Slay Monster' rule...");
  const rule1Tx = await engine.registerRule(
    "SlayMonster",           // eventName
    "difficulty >= 1",       // condition
    0,                       // actionType: MINT_REWARD
    50n * 10n ** 18n,        // rewardAmount: 50 tokens
    "",                      // badgeName
    ""                       // badgeMetadata
  );
  const rule1Receipt = await rule1Tx.wait();
  console.log(`   ✓ Rule ID 0: SlayMonster → +50 tokens\n`);

  // Rule 2: Complete Workout → Award badge + 30 points
  console.log("2. Registering 'Complete Workout' rule...");
  const rule2Tx = await engine.registerRule(
    "CompleteWorkout",
    "intensity > 0",
    1,                       // actionType: AWARD_BADGE
    30n * 10n ** 18n,        // rewardAmount (also used for points)
    "Fitness Master",        // badgeName
    "Completed a workout session"
  );
  const rule2Receipt = await rule2Tx.wait();
  console.log(`   ✓ Rule ID 1: CompleteWorkout → Fitness Master badge + 30 points\n`);

  // Rule 3: Meditation → Update score
  console.log("3. Registering 'Meditation Session' rule...");
  const rule3Tx = await engine.registerRule(
    "MeditationSession",
    "duration > 5",
    2,                       // actionType: UPDATE_SCORE
    20n * 10n ** 18n,        // rewardAmount: 20 points
    "Zen Master",
    "Completed meditation session"
  );
  const rule3Receipt = await rule3Tx.wait();
  console.log(`   ✓ Rule ID 2: MeditationSession → +20 points\n`);

  console.log("=== Seeding Complete ===\n");
  console.log("Default rules registered:");
  console.log("  - Rule 0: SlayMonster → +50 tokens");
  console.log("  - Rule 1: CompleteWorkout → Fitness Master badge + 30 points");
  console.log("  - Rule 2: MeditationSession → +20 points");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
