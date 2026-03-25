// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============ Interfaces ============
// We need this interface so the Engine knows how to talk to the Leaderboard
interface ILeaderboardRegistry {
    function awardAchievement(address _player, string memory _name, string memory _description) external returns (uint256);
    function updateScore(address _player, uint256 _points) external;
}

/**
 * @title ReactiveRewardEngine
 * @dev Core protocol for push-based reactive rewards on Somnia Network
 * Users register rules: "When event X fires, trigger action Y"
 * Powered by Somnia Reactivity SDK (no keepers, no polling)
 */
contract ReactiveRewardEngine {
    // ============ Types & Storage ============
    
    enum ActionType {
        MINT_REWARD,      // Mint reward tokens
        AWARD_BADGE,      // Award achievement badge
        UPDATE_SCORE      // Update leaderboard score
    }

    struct Rule {
        uint256 id;
        string eventName;           // e.g., "SlayMonster", "CompleteWorkout"
        string condition;           // e.g., "difficulty > 2", or "always"
        ActionType actionType;
        uint256 rewardAmount;       // Tokens to mint (if MINT_REWARD)
        string badgeName;           // Badge name (if AWARD_BADGE)
        string badgeMetadata;       // Badge description/uri
        address owner;
        bool isActive;
        uint256 createdAt;
    }

    struct Event {
        uint256 id;
        address user;               
        string eventName;
        string metadata;            // Custom event data as JSON
        uint256 timestamp;
        bool processed;
    }

    // ============ State ============
    
    address public admin;
    address public eventHandler;    
    address public leaderboardRegistry; // <-- Added this to fix the missing state variable!
    
    uint256 private _ruleCounter;
    uint256 private _eventCounter;
    
    mapping(uint256 => Rule) public rules;
    mapping(uint256 => Event) public events;
    mapping(address => uint256) public userRewardBalance;
    mapping(address => uint256[]) public userAchievements;
    
    // Event history for Somnia Reactivity SDK to listen
    event RuleRegistered(
        uint256 indexed ruleId,
        address indexed owner,
        string eventName,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event EventTriggered(
        uint256 indexed eventId,
        address indexed user,
        string eventName,
        string metadata,
        uint256 timestamp
    );
    
    event RewardMinted(
        address indexed user,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    event AchievementUnlocked(
        address indexed user,
        uint256 badgeId,
        string badgeName,
        uint256 timestamp
    );
    
    event ScoreUpdated(
        address indexed user,
        uint256 newScore,
        int256 delta,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyEventHandler() {
        require(msg.sender == eventHandler, "Only EventHandler");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        admin = msg.sender;
        _ruleCounter = 0;
        _eventCounter = 0;
    }
    
    // ============ Rule Management ============
    
    function registerRule(
        string memory _eventName,
        string memory _condition,
        ActionType _actionType,
        uint256 _rewardAmount,
        string memory _badgeName,
        string memory _badgeMetadata
    ) external returns (uint256) {
        require(bytes(_eventName).length > 0, "Event name required");
        
        uint256 ruleId = _ruleCounter++;
        _ruleCounter = ruleId + 1;
        
        rules[ruleId] = Rule({
            id: ruleId,
            eventName: _eventName,
            condition: _condition,
            actionType: _actionType,
            rewardAmount: _rewardAmount,
            badgeName: _badgeName,
            badgeMetadata: _badgeMetadata,
            owner: msg.sender,
            isActive: true,
            createdAt: block.timestamp
        });
        
        emit RuleRegistered(ruleId, msg.sender, _eventName, _rewardAmount, block.timestamp);
        return ruleId;
    }
    
    function emitCustomEvent(
        string memory _eventName,
        string memory _metadata
    ) external {
        uint256 eventId = _eventCounter;
        _eventCounter++;
        
        events[eventId] = Event({
            id: eventId,
            user: msg.sender,
            eventName: _eventName,
            metadata: _metadata,
            timestamp: block.timestamp,
            processed: false
        });
        
        emit EventTriggered(eventId, msg.sender, _eventName, _metadata, block.timestamp);
    }
    
    // ============ Action Execution ============
    
    function executeAction(
        address _user,
        uint256 _ruleId
    ) external onlyEventHandler {
        require(_user != address(0), "Invalid user");
        require(_ruleId < _ruleCounter, "Rule not found");
        
        Rule storage rule = rules[_ruleId];
        require(rule.isActive, "Rule not active");
        
        if (rule.actionType == ActionType.MINT_REWARD) {
            _mintReward(_user, rule.rewardAmount, rule.eventName);
        } else if (rule.actionType == ActionType.AWARD_BADGE) {
            _awardBadge(_user, _ruleId, rule.badgeName, rule.badgeMetadata);
        } else if (rule.actionType == ActionType.UPDATE_SCORE) {
            _updateScore(_user, rule.rewardAmount);
        }
    }
    
    function _mintReward(address _user, uint256 _amount, string memory _reason) internal {
        userRewardBalance[_user] += _amount;
        emit RewardMinted(_user, _amount, _reason, block.timestamp);
    }
    
    function _awardBadge(address _user, uint256 _badgeId, string memory _badgeName, string memory _metadata) internal {
        userAchievements[_user].push(_badgeId);
        
        // Actually save to leaderboard on the blockchain
        if (leaderboardRegistry != address(0)) {
            ILeaderboardRegistry(leaderboardRegistry).awardAchievement(_user, _badgeName, _metadata);
        }
        
        emit AchievementUnlocked(_user, _badgeId, _badgeName, block.timestamp);
    }
    
    function _updateScore(address _user, uint256 _deltaScore) internal {
        userRewardBalance[_user] += _deltaScore; 
        
        // Actually save to leaderboard on the blockchain
        if (leaderboardRegistry != address(0)) {
            ILeaderboardRegistry(leaderboardRegistry).updateScore(_user, _deltaScore);
        }
        
        emit ScoreUpdated(_user, userRewardBalance[_user], int256(_deltaScore), block.timestamp);
    }
    
    // ============ Query Functions ============
    
    function getRule(uint256 _ruleId) external view returns (Rule memory) {
        return rules[_ruleId];
    }
    
    function getEvent(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }
    
    function getEventTuple(uint256 _eventId) external view returns (address, string memory, string memory, uint256, bool) {
        Event memory evt = events[_eventId];
        return (evt.user, evt.eventName, evt.metadata, evt.timestamp, evt.processed);
    }
    
    function getUserRewards(address _user) external view returns (uint256) {
        return userRewardBalance[_user];
    }
    
    function getUserAchievements(address _user) external view returns (uint256[] memory) {
        return userAchievements[_user];
    }
    
    function getRuleCounter() external view returns (uint256) {
        return _ruleCounter;
    }
    
    function getEventCounter() external view returns (uint256) {
        return _eventCounter;
    }
    
    // ============ Admin Functions ============
    
    function toggleRule(uint256 _ruleId) external onlyAdmin {
        require(_ruleId < _ruleCounter, "Rule not found");
        rules[_ruleId].isActive = !rules[_ruleId].isActive;
    }
    
    function setEventHandler(address _handler) external onlyAdmin {
        require(_handler != address(0), "Invalid handler");
        eventHandler = _handler;
    }

    // <-- Added this to link the Leaderboard
    function setLeaderboardRegistry(address _registry) external onlyAdmin {
        require(_registry != address(0), "Invalid registry");
        leaderboardRegistry = _registry;
    }
}