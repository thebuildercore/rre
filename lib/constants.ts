// ============ Network Configuration ============

export const SOMNIA_TESTNET = {
  id: 50312, 
  name: "Somnia Testnet",
  network: "somnia-testnet",
  nativeCurrency: { name: "Somnia", symbol: "SOMI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network/"] }, // FIXED: Updated to the correct RPC
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://shannon-explorer.somnia.network" },
  },
};

// ============ Contract Addresses ============
export const CONTRACT_ADDRESSES = {
  LEADERBOARD: "0x9caDEF56D6d8E2371035A1E743E7e54Fdfc77B90",
  ENGINE: "0x045Cb861913851b06F37c212C1da5d36193511f0",
  HANDLER: "0x0414F325a014A327E623712214EBEAC2Eb9cdDB1",
};
// export const CONTRACT_ADDRESSES = {
//   ENGINE: "0x0C6E2eB7c8761D5103F744E09c832c68cCBd10f9" as `0x${string}`,
//   HANDLER: "0xE474A6F728F8eE2D22a686eC52135d21b7AD99Bd" as `0x${string}`,
//   LEADERBOARD: "0xB510b1A90Fc3A34d1B464D69ad94448de7924ab5" as `0x${string}`,
// };

// ============ Contract ABIs ============

// Generated from the deployed ReactiveRewardEngine.sol
export const REACTIVE_REWARD_ENGINE_ABI = [
  // Write functions
  "function registerRule(string _eventName, string _condition, uint8 _actionType, uint256 _rewardAmount, string _badgeName, string _badgeMetadata) external returns (uint256)",
  "function emitCustomEvent(string _eventName, string _metadata) external",
  
  // Read functions
  "function getRuleCounter() external view returns (uint256)",
  // Notice the "tuple(...)" right here 
  "function getRule(uint256 _ruleId) external view returns (tuple(uint256 id, string eventName, string condition, uint8 actionType, uint256 rewardAmount, string badgeName, string badgeMetadata, address owner, bool isActive, uint256 createdAt))",
  
  // Events
  "event EventTriggered(uint256 indexed eventId, address indexed user, string eventName, string metadata, uint256 timestamp)"
];

// Generated from the deployed LeaderboardRegistry.sol
export const LEADERBOARD_REGISTRY_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_player", "type": "address" }],
    "name": "registerPlayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_player", "type": "address" },
      { "internalType": "uint256", "name": "_points", "type": "uint256" }
    ],
    "name": "updateScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_player", "type": "address" }],
    "name": "getPlayerStats",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "playerAddress", "type": "address" },
          { "internalType": "uint256", "name": "score", "type": "uint256" },
          { "internalType": "uint256", "name": "rank", "type": "uint256" },
          { "internalType": "uint256", "name": "achievementCount", "type": "uint256" },
          { "internalType": "uint256", "name": "lastScoreUpdate", "type": "uint256" },
          { "internalType": "bool", "name": "isActive", "type": "bool" }
        ],
        "internalType": "struct LeaderboardRegistry.PlayerStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_limit", "type": "uint256" }],
    "name": "getTopPlayers",
    "outputs": [
      { "internalType": "address[]", "name": "", "type": "address[]" },
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Generated from the deployed EventHandler.sol
export const EVENT_HANDLER_ABI = [
  "function subscribeToRule(uint256 _ruleId, string _eventName) external returns (uint256)",
  "function processReactionPush(address _user, string _eventName) external",
  "event ReactionProcessed(address indexed user, string eventName, uint256 actionType, uint256 timestamp)"
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