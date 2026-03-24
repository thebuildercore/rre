// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ReactiveRewardEngine.sol";

/**
 * @title EventHandler
 * @dev Somnia Reactivity SDK integration - handles push-based reactions
 * Listens to EventTriggered events from ReactiveRewardEngine
 * Automatically executes matching rules without any external keeper
 * 
 * In production, this would inherit from SomniaEventHandler precompile:
 * contract EventHandler is SomniaEventHandler {
 *   function _onEvent(uint256 subscriptionId, address publisher, bytes calldata inputs) internal override { ... }
 * }
 * 
 * For MVP, we simulate the behavior with manual rule matching
 */

contract EventHandler {
    
    ReactiveRewardEngine public rewardEngine;
    address public admin;
    
    // Subscription tracking (in real Somnia, this is handled by precompile)
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
        subscriptionCounter = 0;
    }
    
    // ============ Somnia Reactivity Simulation ============
    
    /**
     * @dev Simulate Somnia Reactivity push: Create a subscription to a rule
     * In real Somnia: would call reactivity precompile with filter + callback
     * Here: we manually subscribe and execute when events are detected
     */
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
    
    /**
     * @dev Handle event reaction (simulates Somnia's _onEvent callback)
     * In real Somnia: automatically triggered by push when event matches filter
     * Here: called when an event is detected matching a subscription
     * 
     * On real Somnia testnet, this signature would be:
     * function _onEvent(uint256 subscriptionId, address publisher, bytes calldata inputs) internal override
     * 
     * For MVP, we provide a trigger mechanism to simulate the push
     */
    function handleEventReaction(
        uint256 _subscriptionId,
        address _user,
        string memory _eventName
    ) external {
        // In production, this would be called automatically by Somnia validators
        // For MVP/demo, can be called by a keeper or manually for showcase
        
        require(subscriptions[_subscriptionId].active, "Subscription not active");
        
        RuleSubscription memory sub = subscriptions[_subscriptionId];
        
        // Verify event name matches subscription
        require(keccak256(abi.encodePacked(sub.eventName)) == keccak256(abi.encodePacked(_eventName)), "Event mismatch");
        
        // Execute the rule action
        rewardEngine.executeAction(_user, sub.ruleId);
        
        emit RuleExecuted(sub.ruleId, _user, _eventName, block.timestamp);
        emit ReactionProcessed(_user, _eventName, 0, block.timestamp);
    }
    
    /**
     * @dev Automatic push-based reaction trigger
     * On real Somnia, this happens automatically when EventTriggered event is detected
     * For MVP, this demonstrates the concept
     */
    function processEvent(
        uint256 _eventId
    ) external {
        // Retrieve event from engine
        (address user, string memory eventName, , , ) = rewardEngine.getEventTuple(_eventId);
        
        // Find matching subscriptions and execute
        for (uint256 i = 0; i < subscriptionCounter; i++) {
            RuleSubscription memory sub = subscriptions[i];
            
            if (sub.active && keccak256(abi.encodePacked(sub.eventName)) == keccak256(abi.encodePacked(eventName))) {
                // Rule matched! Execute immediately (this is the push-based reaction)
                rewardEngine.executeAction(user, sub.ruleId);
                emit RuleExecuted(sub.ruleId, user, eventName, block.timestamp);
            }
        }
    }
    
    // ============ Query Functions ============
    
    function getSubscription(uint256 _subscriptionId) external view returns (RuleSubscription memory) {
        return subscriptions[_subscriptionId];
    }
    
    function toggleSubscription(uint256 _subscriptionId) external {
        require(msg.sender == admin, "Only admin");
        subscriptions[_subscriptionId].active = !subscriptions[_subscriptionId].active;
    }
}
