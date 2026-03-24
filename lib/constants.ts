// ============ Network Configuration ============

export const SOMNIA_TESTNET = {
  id: 1001, // Somnia testnet chain ID
  name: "Somnia Testnet",
  network: "somnia-testnet",
  nativeCurrency: { name: "Somnia", symbol: "SOMI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.somnia.network"] },
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://testnet-explorer.somnia.network" },
  },
};

// ============ Contract Addresses ============

export const CONTRACT_ADDRESSES = {
  ENGINE: (process.env.NEXT_PUBLIC_ENGINE_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  HANDLER: (process.env.NEXT_PUBLIC_HANDLER_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  LEADERBOARD: (process.env.NEXT_PUBLIC_LEADERBOARD_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
};

// ============ Contract ABIs ============

export const REACTIVE_REWARD_ENGINE_ABI = [
  {
    inputs: [{ internalType: "string", name: "_eventName", type: "string" }],
    name: "emitCustomEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_eventName", type: "string" },
      { internalType: "string", name: "_condition", type: "string" },
      { internalType: "uint8", name: "_actionType", type: "uint8" },
      { internalType: "uint256", name: "_rewardAmount", type: "uint256" },
      { internalType: "string", name: "_badgeName", type: "string" },
      { internalType: "string", name: "_badgeMetadata", type: "string" },
    ],
    name: "registerRule",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_ruleId", type: "uint256" }],
    name: "getRule",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "string", name: "eventName", type: "string" },
          { internalType: "string", name: "condition", type: "string" },
          { internalType: "uint8", name: "actionType", type: "uint8" },
          { internalType: "uint256", name: "rewardAmount", type: "uint256" },
          { internalType: "string", name: "badgeName", type: "string" },
          { internalType: "string", name: "badgeMetadata", type: "string" },
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "bool", name: "isActive", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
        ],
        internalType: "struct ReactiveRewardEngine.Rule",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserRewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_user", type: "address" }],
    name: "getUserAchievements",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "eventId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "eventName", type: "string" },
      { indexed: false, internalType: "string", name: "metadata", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "EventTriggered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "string", name: "reason", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "RewardMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "badgeId", type: "uint256" },
      { indexed: false, internalType: "string", name: "badgeName", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "AchievementUnlocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "newScore", type: "uint256" },
      { indexed: false, internalType: "int256", name: "delta", type: "int256" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "ScoreUpdated",
    type: "event",
  },
];

export const LEADERBOARD_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "address", name: "_player", type: "address" }],
    name: "registerPlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_player", type: "address" },
      { internalType: "uint256", name: "_points", type: "uint256" },
    ],
    name: "updateScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_player", type: "address" }],
    name: "getPlayerStats",
    outputs: [
      {
        components: [
          { internalType: "address", name: "playerAddress", type: "address" },
          { internalType: "uint256", name: "score", type: "uint256" },
          { internalType: "uint256", name: "rank", type: "uint256" },
          { internalType: "uint256", name: "achievementCount", type: "uint256" },
          { internalType: "uint256", name: "lastScoreUpdate", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct LeaderboardRegistry.PlayerStats",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ============ Mock Rules (for demo) ============

export const MOCK_RULES = [
  {
    id: 0,
    eventName: "SlayMonster",
    condition: "difficulty >= 1",
    actionType: 0,
    rewardAmount: BigInt(50) * BigInt(10 ** 18),
    badgeName: "",
    badgeMetadata: "",
  },
  {
    id: 1,
    eventName: "CompleteWorkout",
    condition: "intensity > 0",
    actionType: 1,
    rewardAmount: BigInt(30) * BigInt(10 ** 18),
    badgeName: "Fitness Master",
    badgeMetadata: "Completed a workout session",
  },
  {
    id: 2,
    eventName: "MeditationSession",
    condition: "duration > 5",
    actionType: 2,
    rewardAmount: BigInt(20) * BigInt(10 ** 18),
    badgeName: "Zen Master",
    badgeMetadata: "Completed meditation session",
  },
];

// ============ Demo Mode ============

export const IS_DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
