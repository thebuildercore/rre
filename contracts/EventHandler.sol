// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReactiveRewardEngine.sol";

/**
 * @title EventHandler
 * @dev Somnia Reactivity SDK integration - handles push-based reactions
 */

contract EventHandler {
    
    ReactiveRewardEngine public rewardEngine;
    address public admin;
    
    mapping(uint256 => RuleSubscription) public subscriptions;
    uint256 public subscriptionCounter;
    
    struct RuleSubscription {
        uint256 subscriptionId;
        uint256 ruleId;
        string eventName;
        bool active;
    }
    
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        uint256 indexed ruleId,
        string eventName
    );
    
    event RuleExecuted(
        uint256 indexed ruleId,
        address indexed user,
        string eventName,
        uint256 timestamp
    );
    
    event ReactionProcessed(
        address indexed user,
        string eventName,
        uint256 actionType,
        uint256 timestamp
    );
    
    // ============ Constructor ============
    
    constructor(address _rewardEngine) {
        require(_rewardEngine != address(0), "Invalid engine");
        rewardEngine = ReactiveRewardEngine(_rewardEngine);
        admin = msg.sender;
    }
    
    // ============ Subscription Logic ============
    
    function subscribeToRule(uint256 _ruleId, string memory _eventName) external returns (uint256) {
        require(_ruleId < rewardEngine.getRuleCounter(), "Rule not found");
        
        uint256 subscriptionId = subscriptionCounter++;
        
        subscriptions[subscriptionId] = RuleSubscription({
            subscriptionId: subscriptionId,
            ruleId: _ruleId,
            eventName: _eventName,
            active: true
        });
        
        emit SubscriptionCreated(subscriptionId, _ruleId, _eventName);
        
        return subscriptionId;
    }
    
    function toggleSubscription(uint256 _subscriptionId) external {
        require(msg.sender == admin, "Only admin");
        subscriptions[_subscriptionId].active = !subscriptions[_subscriptionId].active;
    }
    
    // ============ Core Reactivity ============
    
    /**
     * @dev The true Reactivity Push Endpoint.
     * Off-chain node calls this instantly when event is detected
     */
    function processReactionPush(address _user, string memory _eventName) external {
        bool ruleMatched = false;
        bytes32 eventHash = keccak256(abi.encodePacked(_eventName));
        
        for (uint256 i = 0; i < subscriptionCounter; i++) {
            RuleSubscription storage sub = subscriptions[i];
            
            if (
                sub.active &&
                keccak256(abi.encodePacked(sub.eventName)) == eventHash
            ) {
                // Execute rule
                rewardEngine.executeAction(_user, sub.ruleId);
                
                uint256 actionType = uint256(
                    rewardEngine.getRule(sub.ruleId).actionType
                );
                
                emit RuleExecuted(sub.ruleId, _user, _eventName, block.timestamp);
                emit ReactionProcessed(_user, _eventName, actionType, block.timestamp);
                
                ruleMatched = true;
            }
        }
        
        require(ruleMatched, "No active rules for this event");
    }
    
    /**
     * @dev Manual simulation (MVP fallback)
     */
    function processEvent(uint256 _eventId) external {
        (address user, string memory eventName, , , ) = rewardEngine.getEventTuple(_eventId);
        
        bytes32 eventHash = keccak256(abi.encodePacked(eventName));
        
        for (uint256 i = 0; i < subscriptionCounter; i++) {
            RuleSubscription storage sub = subscriptions[i];
            
            if (
                sub.active &&
                keccak256(abi.encodePacked(sub.eventName)) == eventHash
            ) {
                rewardEngine.executeAction(user, sub.ruleId);
                
                emit RuleExecuted(sub.ruleId, user, eventName, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Simulated callback-style handler (Somnia-like)
     */
    function handleEventReaction(
        uint256 _subscriptionId,
        address _user,
        string memory _eventName
    ) external {
        RuleSubscription storage sub = subscriptions[_subscriptionId];
        
        require(sub.active, "Subscription not active");
        
        require(
            keccak256(abi.encodePacked(sub.eventName)) ==
            keccak256(abi.encodePacked(_eventName)),
            "Event mismatch"
        );
        
        rewardEngine.executeAction(_user, sub.ruleId);
        
        emit RuleExecuted(sub.ruleId, _user, _eventName, block.timestamp);
        emit ReactionProcessed(_user, _eventName, 0, block.timestamp);
    }
    
    // ============ Views ============
    
    function getSubscription(uint256 _subscriptionId) external view returns (RuleSubscription memory) {
        return subscriptions[_subscriptionId];
    }
}