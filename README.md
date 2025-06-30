# 3SIPS - AI Managed Investment
*Autonomous Cross-Chain Investment Platform powered by AI*

![WhatsApp Image 2025-06-30 at 07 58 49_5f28c617](https://github.com/user-attachments/assets/66d568cc-8b90-4895-a4fb-221280ae9650)

**Features** • **Architecture** • **Quick Start** • **Development**

[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?style=for-the-badge&logo=avalanche&logoColor=white)](https://www.avax.network/)
[![Chainlink](https://img.shields.io/badge/Chainlink-375BD2?style=for-the-badge&logo=chainlink&logoColor=white)](https://chain.link/)
[![ElizaOS](https://img.shields.io/badge/ElizaOS-FF6B6B?style=for-the-badge&logo=robot&logoColor=white)](https://elizaos.github.io/)

## 🌟 Overview
3SIPS is the world's first autonomous AI agent that manages real cryptocurrency investments across multiple blockchains. Built on Avalanche with Chainlink Automation and ElizaOS, it creates Systematic Investment Plans (SIP) and autonomously optimizes portfolios through natural language interaction.

## 🎯 Use Cases
- **Automated Crypto SIPs**: Set up systematic investment plans with AI management
- **Cross-Chain Yield Optimization**: Maximize returns across Avalanche ecosystem  
- **Emergency Fund Protection**: AI-powered crisis management and fund security
- **Natural Language DeFi**: Interact with complex protocols through simple chat

## ✨ Features
- **🤖 AI-Powered Management**: Autonomous portfolio optimization and rebalancing
- **⚡ Chainlink Automation**: Recurring deposits without manual intervention
- **🌉 Cross-Chain Intelligence**: Smart fund distribution across Fuji, Echo, Dispatch
- **💬 Natural Language Interface**: Create SIPs and manage funds through conversation
- **🛡️ Emergency Protection**: Automated security protocols and fund locking
- **📊 Real-Time Monitoring**: Live portfolio tracking across all chains

## 🏗 Architecture

```
User (Natural Language)
         ↓
    ElizaOS AI Agent
         ↓
   Chainlink Automation
         ↓
    Smart Contracts
         ↓
Multi-Chain Distribution (ICTT)
```

### **Multi-Chain Strategy**
- **🏔️ Fuji Chain (30%)**: Liquidity hub and main SIP management
- **🌊 Echo Chain (60%)**: High-yield farming
- **⚡ Dispatch Chain (10%)**: Emergency protection and security

## 🚀 Technical Stack
- **AI Framework**: ElizaOS for conversational AI and autonomous decisions
- **Automation**: Chainlink Automation for scheduled deposits
- **Cross-Chain**: Avalanche ICTT for seamless multi-chain transfers
- **Smart Contracts**: Solidity deployed on Avalanche Fuji/Echo/Dispatch
- **Backend**: TypeScript, Node.js, ethers.js
- **Frontend**: React with Web3 integration

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= v18.18
Bun package manager
MetaMask wallet
AVAX testnet tokens
```

### Installation
```bash
# Clone the repository
git clone https://github.com/omsant02/3SIPS.git
cd 3SIPS

# Install dependencies
bun install
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your configuration
OPENAI_API_KEY=your_openai_key
AI_AGENT_PRIVATE_KEY=your_private_key
FUJI_HOME_CONTRACT=0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337
```

### Start the AI Agent
```bash
# Build the project
bun run build

# Start the agent
bun run start
```

### Make Your First Investment
```
💬 "Create a SIP plan with 20 tokens monthly for retirement"
🤖 "Creating your autonomous investment plan across 3 chains..."
```

## 🛠 Development

### Local Setup
```bash
# Install dependencies
bun install

# Start development mode
bun run dev

# Run tests
bun test
```

### Smart Contract Deployment
```bash
# Deploy to Fuji testnet
forge script script/Deploy.s.sol --rpc-url $FUJI_RPC_URL --broadcast

# Verify contracts
forge verify-contract $CONTRACT_ADDRESS src/ERC20TokenHome.sol:ERC20TokenHome
```

## 📋 Environment Variables

```bash
# Essential Configuration
OPENAI_API_KEY=your_openai_api_key
AI_AGENT_PRIVATE_KEY=your_wallet_private_key
USER_WALLET_ADDRESS=demo_user_address

# Contract Addresses (Pre-deployed)
SIP_TOKEN_ADDRESS=0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7

FUJI_HOME_CONTRACT=0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337

ECHO_REMOTE_CONTRACT=0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337

DISPATCH_REMOTE_CONTRACT=0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7


# RPC Endpoints
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
ECHO_RPC_URL=https://subnets.avax.network/echo/testnet/rpc
DISPATCH_RPC_URL=https://subnets.avax.network/dispatch/testnet/rpc
```
SIP
![image](https://github.com/user-attachments/assets/4f1ddf59-612f-4c2c-8efa-f903347a6070)

Fuji
![image](https://github.com/user-attachments/assets/834dfa6a-3eea-4ecf-ab13-10a36c5fa7a8)

ECHO
![image](https://github.com/user-attachments/assets/766e47ea-f3fc-451f-8a38-6ed5a0a8a4d8)

DISPATCH
![image](https://github.com/user-attachments/assets/f663c709-9967-407a-b085-54efd0652e2d)

## 💬 Example Commands

### Create Investment Plan
```
💬 "Create a SIP plan with 50 tokens monthly for retirement"
🤖 "Perfect! Creating your retirement SIP with automated deposits..."
```

### Check Portfolio Status  
```
💬 "Show me my portfolio status"
🤖 "Your portfolio: 150 SIP across 3 chains - Fuji: 45, Echo: 90, Dispatch: 15"
```

### Cross-Chain Transfer
```
💬 "Move 10 tokens from fuji to echo for better yields"
🤖 "Executing cross-chain transfer for yield optimization..."
```

### Emergency Protection
```
💬 "Emergency! Protect my funds!"
🤖 "Emergency protocols activated across all chains. Funds secured."
```

## 🔗 Live Integrations

### **Chainlink Automation**
- **Registry**: [[automation.chain.link/fuji/98412892427...](https://automation.chain.link/fuji/98412892427763518378033155737059867708698228427161324331587337205216259379071](https://automation.chain.link/fuji/98412892427763518378033155737059867708698228427161324331587337205216259379071))
- **Status**: ✅ Active with 50 LINK balance
- **Function**: Automated SIP deposits every 24 hours

### **Contract Addresses**
```
🏔️ Fuji Home:     0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337
🌊 Echo Remote:    0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337  
⚡ Dispatch Remote: 0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7
🪙 SIP Token:      0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7
🤖 AI Agent:       0x565A693cB0838e8ea2A8BBdb3b749893E7ED7f9d
```

## 🎯 How It Works

### **1. User Interaction**
Users interact with the AI agent through natural language commands to create SIPs, check balances, or manage their portfolio.

### **2. AI Decision Making**
The ElizaOS-powered agent analyzes market conditions and makes autonomous decisions about fund allocation and optimization strategies.

### **3. Automated Execution**
Chainlink Automation triggers recurring deposits, while the AI executes cross-chain transfers using Avalanche ICTT for optimal yield.

### **4. Portfolio Optimization**
Funds are distributed across three specialized chains:
- **Fuji**: Stability and liquidity (30%)
- **Echo**: High-yield farming (60%) 
- **Dispatch**: Emergency security (10%)

## 🔒 Security Features

### **Smart Contract Security**
- Multi-signature controls and emergency pause mechanisms
- Authorized agent system with cryptographic validation
- Fund locking capabilities and automated security responses

### **AI Agent Security**
- Private key management with secure wallet integration
- Transaction signing protocols and emergency override capabilities
- Real-time threat detection and response

## 📊 Performance Metrics

- **⚡ Transaction Speed**: <30 seconds for cross-chain transfers
- **💰 Yield Optimization**: Up to 5.2% APY on Echo chain
- **🛡️ Security**: 99.9% uptime with emergency protection
- **🤖 AI Response**: <2 seconds for natural language processing

## 🌍 Supported Networks

| Network | Chain ID | Purpose | Contract |
|---------|----------|---------|----------|
| Avalanche Fuji | 43113 | Main Hub | 0xD3f07713... |
| Avalanche Echo | 173750 | Yield Farming | 0xD3f07713... |
| Avalanche Dispatch | 779672 | Emergency | 0xa7E756116a... |


## 🎉 Try It Now!

**Experience the future of autonomous investing:**

1. **🔗 Connect**: Link your wallet to the platform
2. **💬 Chat**: Create your SIP plan with natural language
3. **🤖 Relax**: Watch AI optimize your investments 24/7
4. **💰 Profit**: Enjoy automated cross-chain yield optimization

**The future of investment management is autonomous, cross-chain, and AI-powered.** 🚀

---

*Built with ❤️ for the Chainlink Chromion Hackathon 2025*

**Made possible by**: Avalanche • Chainlink • ElizaOS
