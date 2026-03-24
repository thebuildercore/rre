// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LeaderboardRegistry
 * @dev On-chain leaderboard tracking scores, ranks, and achievements
 */
contract LeaderboardRegistry {
    
    // ============ Types & Storage ============
    
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
    
    address public admin;
    address public rewardEngine;
    
    uint256 public totalPlayers;
    uint256 public achievementCounter;
    
    mapping(address => PlayerStats) public playerStats;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public playerAchievementIds;
    
    address[] public topPlayers;
    mapping(address => uint256) public playerRank;
    
    event PlayerRegistered(address indexed player, uint256 timestamp);
    event ScoreUpdated(address indexed player, uint256 newScore, int256 delta, uint256 timestamp);
    event RankUpdated(address indexed player, uint256 newRank, uint256 timestamp);
    event AchievementAdded(uint256 indexed achievementId, address indexed player, string name, uint256 timestamp);
    event LeaderboardUpdated(uint256 totalPlayers, uint256 timestamp);
    
    modifier onlyRewardEngine() {
        require(msg.sender == rewardEngine, "Only reward engine");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        totalPlayers = 0;
        achievementCounter = 0;
    }
    
    function setRewardEngine(address _engine) external onlyAdmin {
        require(_engine != address(0), "Invalid engine");
        rewardEngine = _engine;
    }
    
    // ============ THE FIX IS HERE (Changed external to public) ============
    function registerPlayer(address _player) public {
        require(_player != address(0), "Invalid player");
        require(!playerStats[_player].isActive, "Already registered");
        
        playerStats[_player] = PlayerStats({
            playerAddress: _player,
            score: 0,
            rank: totalPlayers + 1,
            achievementCount: 0,
            lastScoreUpdate: block.timestamp,
            isActive: true
        });
        
        totalPlayers++;
        emit PlayerRegistered(_player, block.timestamp);
    }
    
    function updateScore(address _player, uint256 _points) external onlyRewardEngine {
        PlayerStats storage stats = playerStats[_player];
        
        if (!stats.isActive) {
            registerPlayer(_player);
        }
        
        uint256 oldScore = stats.score;
        stats.score += _points;
        stats.lastScoreUpdate = block.timestamp;
        
        emit ScoreUpdated(_player, stats.score, int256(_points), block.timestamp);
        _updateLeaderboard();
    }
    
    function awardAchievement(
        address _player,
        string memory _name,
        string memory _description
    ) external onlyRewardEngine returns (uint256) {
        // Also make sure they are registered here!
        if (!playerStats[_player].isActive) {
            registerPlayer(_player);
        }

        uint256 achievementId = achievementCounter++;
        
        achievements[achievementId] = Achievement({
            id: achievementId,
            name: _name,
            description: _description,
            earnedBy: _player,
            earnedAt: block.timestamp
        });
        
        playerAchievementIds[_player].push(achievementId);
        
        PlayerStats storage stats = playerStats[_player];
        if (stats.isActive) {
            stats.achievementCount++;
        }
        
        emit AchievementAdded(achievementId, _player, _name, block.timestamp);
        return achievementId;
    }
    
    function _updateLeaderboard() internal {
        emit LeaderboardUpdated(totalPlayers, block.timestamp);
    }
    
    function getTopPlayers(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        uint256 count = 0;
        address[] memory addresses = new address[](min(_limit, totalPlayers));
        uint256[] memory scores = new uint256[](min(_limit, totalPlayers));
        return (addresses, scores);
    }
    
    function getPlayerRank(address _player) external view returns (uint256) {
        return playerStats[_player].rank;
    }
    
    function getPlayerStats(address _player) external view returns (PlayerStats memory) {
        return playerStats[_player];
    }
    
    function getPlayerAchievements(address _player) external view returns (uint256[] memory) {
        return playerAchievementIds[_player];
    }
    
    function getAchievement(uint256 _id) external view returns (Achievement memory) {
        return achievements[_id];
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}