require('dotenv').config();
const { ethers } = require('ethers');

// Setup Somnia Testnet
const provider = new ethers.JsonRpcProvider("https://dream-rpc.somnia.network/");
const keeperWallet = new ethers.Wallet(process.env.KEEPER_PRIVATE_KEY, provider);

// === INSERT YOUR NEW DEPLOYED ADDRESSES HERE ===
const ENGINE_ADDRESS = "0x..."; 
const HANDLER_ADDRESS = "0x...";

// Minimal ABIs
const ENGINE_ABI = ["event EventTriggered(uint256 indexed eventId, address indexed user, string eventName, string metadata, uint256 timestamp)"];
const HANDLER_ABI = ["function processReactionPush(address _user, string memory _eventName) external"];

async function main() {
    console.log("=================================================");
    console.log("🟢 Somnia Reactivity SDK Node is ONLINE");
    console.log(`📡 Listening for Events on: ${ENGINE_ADDRESS}`);
    console.log(`🤖 Keeper Wallet: ${keeperWallet.address}`);
    console.log("=================================================\n");

    const engineContract = new ethers.Contract(ENGINE_ADDRESS, ENGINE_ABI, provider);
    const handlerContract = new ethers.Contract(HANDLER_ADDRESS, HANDLER_ABI, keeperWallet);

    // Listen to the Engine's EventTriggered log
    engineContract.on("EventTriggered", async (eventId, user, eventName, metadata, timestamp, event) => {
        console.log(`\n⚡ [EVENT DETECTED] Block: ${event.log.blockNumber}`);
        console.log(`   User: ${user}`);
        console.log(`   Action: ${eventName}`);
        
        try {
            console.log(`⚙️  Reactivity SDK routing to EventHandler...`);
            
            // Push the reaction transaction to the Handler!
            const tx = await handlerContract.processReactionPush(user, eventName);
            console.log(`🚀 Transaction Pushed! Hash: ${tx.hash}`);
            
            await tx.wait();
            console.log(`✅ Reaction Processed Successfully on Somnia!`);
            
        } catch (error) {
            console.error(`❌ Reaction Failed:`, error.reason || error.message);
        }
    });
}

main().catch(console.error);