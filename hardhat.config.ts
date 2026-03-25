import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    "somnia-testnet": {
      url: process.env.SOMNIA_TESTNET_RPC || "https://dream-rpc.somnia.network/",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 50312,
    },
  },
};

export default config;