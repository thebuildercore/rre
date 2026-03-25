// require('dotenv').config();
// const { ethers } = require('ethers');

// const provider = new ethers.JsonRpcProvider("https://dream-rpc.somnia.network/");
// const keeper = new ethers.Wallet(process.env.KEEPER_PRIVATE_KEY, provider);

// const ENGINE_ADDR = "0x045Cb861913851b06F37c212C1da5d36193511f0";
// const HANDLER_ADDR = "0x0414F325a014A327E623712214EBEAC2Eb9cdDB1";

// const ENGINE_ABI = ["event EventTriggered(uint256 indexed eventId, address indexed user, string eventName, string metadata, uint256 timestamp)"];
// const HANDLER_ABI = ["function processReactionPush(address _user, string memory _eventName) external"];

// async function startSDK() {
//     console.log(" Somnia Reactivity SDK: ACTIVE");
//     const engine = new ethers.Contract(ENGINE_ADDR, ENGINE_ABI, provider);
//     const handler = new ethers.Contract(HANDLER_ADDR, HANDLER_ABI, keeper);

//     engine.on("EventTriggered", async (id, user, name) => {
//         console.log(`\n⚡ Event Detected: ${name} from ${user}`);
//         try {
//             const tx = await handler.processReactionPush(user, name);
//             console.log(` Routing Reaction... Tx: ${tx.hash}`);
//             await tx.wait();
//             console.log(`✅ Reward Processed On-Chain!`);
//         } catch (e) {
//             console.error("❌ Reaction failed:", e.reason || e.message);
//         }
//     });
// }

// startSDK();

require('dotenv').config();
const { ethers } = require('ethers');

/**
 * FINAL SOMNIA REACTIVITY SDK NODE
 */

// 1. Sanitize Private Key (Removes hidden spaces/quotes)
const rawKey = process.env.KEEPER_PRIVATE_KEY || "";
const privateKey = rawKey.trim().replace(/["']/g, ""); 

if (!privateKey || privateKey.length < 64) {
    console.error("❌ ERROR: KEEPER_PRIVATE_KEY in .env is invalid or missing.");
    process.exit(1);
}

// 2. Setup Provider & Wallet
const provider = new ethers.JsonRpcProvider("https://dream-rpc.somnia.network/");

let keeper;
try {
    // Ensure 0x prefix is present for Ethers v6
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    keeper = new ethers.Wallet(formattedKey, provider);
} catch (e) {
    console.error("❌ ERROR: Failed to initialize Wallet. Check your Private Key format.");
    process.exit(1);
}

// 3. Contract Configurations
const ENGINE_ADDR = "0x045Cb861913851b06F37c212C1da5d36193511f0";
const HANDLER_ADDR = "0x0414F325a014A327E623712214EBEAC2Eb9cdDB1";

const ENGINE_ABI = [
    "event EventTriggered(uint256 indexed eventId, address indexed user, string eventName, string metadata, uint256 timestamp)"
];
const HANDLER_ABI = [
    "function processReactionPush(address _user, string memory _eventName) external"
];

async function startSDK() {
    console.log("=================================================");
    console.log("🟢 SOMNIA REACTIVITY SDK: ONLINE");
    console.log(`📡 Listening to Engine: ${ENGINE_ADDR}`);
    console.log(`🤖 Keeper Wallet: ${keeper.address}`);
    console.log("=================================================\n");

    const engine = new ethers.Contract(ENGINE_ADDR, ENGINE_ABI, provider);
    const handler = new ethers.Contract(HANDLER_ADDR, HANDLER_ABI, keeper);

    // listen for the event trigger
    engine.on("EventTriggered", async (id, user, name, metadata, timestamp, event) => {
        console.log(`\n⚡ [EVENT DETECTED]`);
        console.log(`   Action: ${name}`);
        console.log(`   User:   ${user}`);
        console.log(`   Block:  ${event.log.blockNumber}`);

        try {
            console.log(`⚙️  Generating Reaction...`);
            
            // Execute the on-chain reaction
            const tx = await handler.processReactionPush(user, name);
            
            console.log(`🚀 Transaction Sent! Hash: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`✅ SUCCESS: Reaction confirmed in block ${receipt.blockNumber}`);
            console.log("-------------------------------------------------");
            
        } catch (err) {
            console.error("❌ REACTION FAILED:");
            if (err.reason) console.error(`   Reason: ${err.reason}`);
            else console.error(`   Message: ${err.message}`);
        }
    });

    // Keep process alive and handle errors
    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

startSDK().catch(err => {
    console.error("❌ CRITICAL STARTUP ERROR:", err);
});