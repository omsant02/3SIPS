import { ethers } from 'ethers';
import { logger, Service, type IAgentRuntime } from '@elizaos/core';
import type { 
  ChainConfig, 
  AllocationStrategy, 
  SIPProgress, 
  UserBalances, 
  TransactionResult 
} from '../types/contracts.js';

export class Web3Service extends Service {
  static serviceType = 'web3';
  capabilityDescription = 'Manages Web3 transactions and cross-chain SIP operations using real smart contracts';

  private chains: Map<string, ChainConfig> = new Map();
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();
  private aiWallet!: ethers.Wallet;
  
  // Contract instances
  private homeContract!: any;
  private echoContract!: any;
  private dispatchContract!: any;
  private sipToken!: any;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.initializeChains();
    this.initializeProviders();
    this.initializeWallet();
    this.initializeContracts();
  }

  private initializeChains() {
    this.chains = new Map([
      ['fuji', {
        chainId: 43113,
        rpcUrl: process.env.FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
        contractAddress: process.env.FUJI_HOME_CONTRACT || '0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337',
        name: 'Avalanche Fuji',
        blockchainId: process.env.FUJI_BLOCKCHAIN_ID || '0x7fc93d85c6d62c5b2ac0b519c87010ea5294012d1e407030d6acd0021cac10d5'
      }],
      ['echo', {
        chainId: 173750,
        rpcUrl: process.env.ECHO_RPC_URL || 'https://subnets.avax.network/echo/testnet/rpc',
        contractAddress: process.env.ECHO_REMOTE_CONTRACT || '0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337',
        name: 'Avalanche Echo',
        blockchainId: process.env.ECHO_BLOCKCHAIN_ID || '0x1278d1be4b987e847be3465940eb5066c4604a7fbd6e086900823597d81af4c1'
      }],
      ['dispatch', {
        chainId: 779672,
        rpcUrl: process.env.DISPATCH_RPC_URL || 'https://subnets.avax.network/dispatch/testnet/rpc',
        contractAddress: process.env.DISPATCH_REMOTE_CONTRACT || '0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7',
        name: 'Avalanche Dispatch',
        blockchainId: process.env.DISPATCH_BLOCKCHAIN_ID || '0x9f3be606497285d0ffbb5ac9ba24aa60346a9b1812479ed66cb329f394a4b1c7'
      }]
    ]);
  }

  private initializeProviders() {
    this.providers = new Map();
    for (const [chainName, config] of this.chains) {
      try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        this.providers.set(chainName, provider);
        logger.info(`✓ Connected to ${config.name}`);
      } catch (error) {
        logger.error(`Failed to connect to ${config.name}:`, error);
      }
    }
  }

  private initializeWallet() {
    // Use the AI agent private key you provided
    const privateKey = process.env.AI_AGENT_PRIVATE_KEY || 'a3b5c293c2a3ea5bfe7a694e6ca11b5ece3b7a8b0374a62267f40a4068974550';
    
    const fujiProvider = this.providers.get('fuji');
    if (!fujiProvider) {
      throw new Error('Fuji provider not initialized');
    }
    
    this.aiWallet = new ethers.Wallet(privateKey, fujiProvider);
    logger.info(`✅ AI Wallet initialized: ${this.aiWallet.address}`);
  }

  private initializeContracts() {
    const fujiProvider = this.providers.get('fuji');
    const echoProvider = this.providers.get('echo');
    const dispatchProvider = this.providers.get('dispatch');

    // Contract ABIs
    const homeABI = [
      "function createSIP(uint256 monthlyAmount, uint256 totalTarget, uint256 intervalDays, string memory goal)",
      "function triggerUserDeposit(address user)",
      "function updateUserAllocation(address user, uint256 fujiPercent, uint256 echoPercent, uint256 dispatchPercent)",
      "function getSIPProgress(address user) view returns (uint256, uint256, uint256, uint256, uint256, bool, bool, string)",
      "function getUserAllocation(address user) view returns (uint256, uint256, uint256)",
      "function addAuthorizedAgent(address agent)",
      "function send(bytes32 destinationBlockchainID, address destinationTokenTransferrerAddress, address recipient, uint256 amount, uint256 requiredGasLimit)",
      "function authorizedAgents(address) view returns (bool)",
      "function userBalances(address) view returns (uint256)",
      "function makeSIPDeposit()"
    ];

    const remoteABI = [
      "function balanceOf(address account) view returns (uint256)",
      "function send(bytes32 destinationBlockchainID, address destinationTokenTransferrerAddress, address recipient, uint256 amount, uint256 requiredGasLimit)",
      "function aiActivateGlobalEmergency()",
      "function aiEmergencyWithdraw(address user, uint256 amount)",
      "function yieldEarned(address user) view returns (uint256)",
      "function claimYield()",
      "function transfer(address to, uint256 value) returns (bool)",
      "function approve(address spender, uint256 value) returns (bool)"
    ];

    const tokenABI = [
      "function balanceOf(address account) view returns (uint256)",
      "function transfer(address to, uint256 value) returns (bool)",
      "function approve(address spender, uint256 value) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function mint(address to, uint256 amount) returns (bool)",
      "function totalSupply() view returns (uint256)"
    ];

    // Initialize contracts
    this.homeContract = new ethers.Contract(
      this.chains.get('fuji')!.contractAddress,
      homeABI,
      fujiProvider
    );

    this.echoContract = new ethers.Contract(
      this.chains.get('echo')!.contractAddress,
      remoteABI,
      echoProvider
    );

    this.dispatchContract = new ethers.Contract(
      this.chains.get('dispatch')!.contractAddress,
      remoteABI,
      dispatchProvider
    );

    this.sipToken = new ethers.Contract(
      process.env.SIP_TOKEN_ADDRESS || '0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7',
      tokenABI,
      fujiProvider
    );

    logger.info('✅ All contracts initialized successfully');
  }

  // ============================================
  // REAL SIP FUNCTIONS WITH PROPER DEPOSITS
  // ============================================

  async createSIP(userAddress: string, monthlyAmount: string, totalTarget: string, goal: string): Promise<TransactionResult> {
    try {
      // ALWAYS USE AI AGENT WALLET FOR EVERYTHING - NO USER METAMASK NEEDED
      const aiAgentAddress = this.aiWallet.address;
      logger.info(`🚀 Creating REAL SIP for AI Agent ${aiAgentAddress}: ${monthlyAmount} monthly, target: ${totalTarget}`);
      
      const monthlyAmountWei = ethers.parseEther(monthlyAmount);
      const totalTargetWei = ethers.parseEther(totalTarget);
      
      // Step 1: Check AI agent authorization
      const homeWithSigner = this.homeContract.connect(this.aiWallet);
      const isAuthorized = await this.homeContract.authorizedAgents(this.aiWallet.address);
      
      if (!isAuthorized) {
        logger.info('🔐 Authorizing AI agent...');
        const authTx = await homeWithSigner.addAuthorizedAgent(this.aiWallet.address);
        await authTx.wait();
        logger.info('✅ AI Agent authorized successfully');
      }

      // Step 2: Create the SIP plan for AI agent (not user)
      const tx = await homeWithSigner.createSIP(
        monthlyAmountWei,
        totalTargetWei,
        1, // 1 day interval for demo
        goal
      );
      
      const receipt = await tx.wait();
      logger.info(`✅ SIP Plan created for AI Agent! TX: ${receipt.hash}`);

      // Step 3: Execute IMMEDIATE first deposit using AI agent's own funds
      await this.executeImmediateDepositForAI(monthlyAmount);

      // Step 4: Start automated deposits via Chainlink for AI agent
      setTimeout(() => this.scheduleChainlinkDepositsForAI(monthlyAmount), 60000); // Start after 1 minute

      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status
      };
    } catch (error: any) {
      logger.error('❌ Failed to create SIP:', error.message);
      throw error;
    }
  }

  async executeImmediateDepositForAI(amount: string): Promise<void> {
    try {
      const aiAgentAddress = this.aiWallet.address;
      logger.info(`🎯 EXECUTING IMMEDIATE DEPOSIT for AI Agent: ${amount} SIP`);
      
      const homeWithSigner = this.homeContract.connect(this.aiWallet);
      const tokenWithSigner = this.sipToken.connect(this.aiWallet);
      const amountWei = ethers.parseEther(amount);
      
      // Check AI agent has enough tokens
      const aiBalance = await this.sipToken.balanceOf(aiAgentAddress);
      logger.info(`💰 AI Agent balance: ${ethers.formatEther(aiBalance)} SIP tokens`);
      
      if (aiBalance < amountWei) {
        logger.info(`❌ Insufficient AI agent balance. Need ${amount} SIP, have ${ethers.formatEther(aiBalance)}`);
        return;
      }
      
      // Approve the home contract to spend AI agent's tokens
      logger.info(`✅ Approving home contract to spend ${amount} SIP tokens...`);
      const approveTx = await tokenWithSigner.approve(
        this.chains.get('fuji')!.contractAddress,
        amountWei
      );
      await approveTx.wait();
      logger.info(`✅ Approval completed: ${approveTx.hash}`);

      // Execute the SIP deposit for AI agent - this will trigger cross-chain transfers
      logger.info(`🚀 Triggering SIP deposit for AI agent...`);
      const depositTx = await homeWithSigner.triggerUserDeposit(aiAgentAddress);
      const depositReceipt = await depositTx.wait();
      
      logger.info(`✅ IMMEDIATE SIP DEPOSIT EXECUTED! TX: ${depositReceipt.hash}`);
      logger.info(`📊 This should distribute funds: 60% Echo, 30% Fuji, 10% Dispatch`);
      
      // Check the resulting balances to show real distribution
      setTimeout(() => this.showBalanceDistribution(aiAgentAddress), 15000);
      
    } catch (error: any) {
      logger.error('❌ AI agent immediate deposit failed:', error.message);
    }
  }

  async scheduleChainlinkDepositsForAI(monthlyAmount: string): Promise<void> {
    try {
      const aiAgentAddress = this.aiWallet.address;
      logger.info(`🤖 Starting Chainlink automation for AI Agent: ${aiAgentAddress}...`);
      
      let depositCount = 0;
      const maxDeposits = 5; // Limit for demo
      
      // Simulate Chainlink Automation by triggering deposits every 60 seconds
      const depositInterval = setInterval(async () => {
        try {
          depositCount++;
          
          if (depositCount > maxDeposits) {
            logger.info(`🎉 Demo completed after ${maxDeposits} deposits! Stopping automation.`);
            clearInterval(depositInterval);
            return;
          }

          logger.info(`🔄 Chainlink Automation #${depositCount}: Triggering deposit for AI Agent`);
          
          // Check AI agent has enough tokens for another deposit
          const aiBalance = await this.sipToken.balanceOf(aiAgentAddress);
          const amountWei = ethers.parseEther(monthlyAmount);
          
          if (aiBalance < amountWei) {
            logger.info(`⚠️ AI agent insufficient balance for deposit #${depositCount}. Stopping automation.`);
            clearInterval(depositInterval);
            return;
          }
          
          // Approve tokens for this deposit
          const tokenWithSigner = this.sipToken.connect(this.aiWallet);
          const approveTx = await tokenWithSigner.approve(
            this.chains.get('fuji')!.contractAddress,
            amountWei
          );
          await approveTx.wait();
          
          // Execute deposit
          const homeWithSigner = this.homeContract.connect(this.aiWallet);
          const depositTx = await homeWithSigner.triggerUserDeposit(aiAgentAddress);
          const depositReceipt = await depositTx.wait();
          
          logger.info(`✅ Chainlink deposit #${depositCount} executed! TX: ${depositReceipt.hash}`);
          
          // Show updated balances after each deposit
          setTimeout(() => this.showBalanceDistribution(aiAgentAddress), 10000);
          
        } catch (error: any) {
          logger.error(`❌ Chainlink deposit #${depositCount} failed:`, error.message);
        }
      }, 90000); // Every 90 seconds for demo visibility
      
    } catch (error: any) {
      logger.error('❌ Failed to schedule Chainlink deposits:', error.message);
    }
  }

  async showBalanceDistribution(walletAddress: string): Promise<void> {
    try {
      logger.info(`📊 Checking REAL balance distribution for ${walletAddress}...`);
      
      const [fujiBalance, echoBalance, dispatchBalance] = await Promise.all([
        this.homeContract.userBalances(walletAddress).catch(() => ethers.parseEther("0")),
        this.echoContract.balanceOf(walletAddress).catch(() => ethers.parseEther("0")),
        this.dispatchContract.balanceOf(walletAddress).catch(() => ethers.parseEther("0"))
      ]);

      logger.info(`💰 REAL BALANCE DISTRIBUTION FOR ${walletAddress}:`);
      logger.info(`   🏔️ Fuji: ${ethers.formatEther(fujiBalance)} SIP`);
      logger.info(`   🌊 Echo: ${ethers.formatEther(echoBalance)} SIP`);
      logger.info(`   ⚡ Dispatch: ${ethers.formatEther(dispatchBalance)} SIP`);
      
      const total = parseFloat(ethers.formatEther(fujiBalance)) + 
                   parseFloat(ethers.formatEther(echoBalance)) + 
                   parseFloat(ethers.formatEther(dispatchBalance));
      
      logger.info(`   💎 Total Distributed: ${total.toFixed(4)} SIP tokens`);
      
      // Also check main token balance on Fuji
      const mainBalance = await this.sipToken.balanceOf(walletAddress);
      logger.info(`   🪙 Remaining on Fuji: ${ethers.formatEther(mainBalance)} SIP tokens`);
      
    } catch (error: any) {
      logger.error('❌ Failed to check balance distribution:', error.message);
    }
  }

  // ===============================================
  // REAL CROSS-CHAIN TRANSFER FUNCTIONS
  // ===============================================

  async crossChainTransfer(
    fromChain: string, 
    toChain: string, 
    amount: string, 
    recipient?: string
  ): Promise<TransactionResult> {
    try {
      // Always use AI agent as both sender and recipient for demo
      const aiAgentAddress = this.aiWallet.address;
      const actualRecipient = recipient || aiAgentAddress;
      
      logger.info(`🌉 REAL cross-chain transfer: ${amount} SIP from ${fromChain} to ${toChain}`);
      logger.info(`🔄 Sender: ${aiAgentAddress}, Recipient: ${actualRecipient}`);
      
      const sourceConfig = this.chains.get(fromChain);
      const targetConfig = this.chains.get(toChain);
      
      if (!sourceConfig || !targetConfig) {
        throw new Error(`Invalid chain configuration: ${fromChain} -> ${toChain}`);
      }

      let contract: any;
      let provider: ethers.JsonRpcProvider;

      // Get the right contract and provider
      if (fromChain === 'fuji') {
        contract = this.homeContract;
        provider = this.providers.get('fuji')!;
      } else if (fromChain === 'echo') {
        contract = this.echoContract;
        provider = this.providers.get('echo')!;
      } else if (fromChain === 'dispatch') {
        contract = this.dispatchContract;
        provider = this.providers.get('dispatch')!;
      } else {
        throw new Error(`Unsupported source chain: ${fromChain}`);
      }

      // Create wallet for the source chain
      const sourceWallet = new ethers.Wallet(
        process.env.AI_AGENT_PRIVATE_KEY || 'a3b5c293c2a3ea5bfe7a694e6ca11b5ece3b7a8b0374a62267f40a4068974550', 
        provider
      );
      const contractWithSigner = contract.connect(sourceWallet);

      const amountWei = ethers.parseEther(amount);
      const gasLimit = 500000;

      // Check if AI agent has enough balance on source chain
      let sourceBalance;
      if (fromChain === 'fuji') {
        sourceBalance = await this.homeContract.userBalances(aiAgentAddress);
      } else {
        sourceBalance = await contract.balanceOf(aiAgentAddress);
      }
      
      if (sourceBalance < amountWei) {
        throw new Error(`Insufficient balance on ${fromChain}: need ${amount}, have ${ethers.formatEther(sourceBalance)}`);
      }

      logger.info(`✅ AI agent has ${ethers.formatEther(sourceBalance)} SIP on ${fromChain}`);

      // Execute the cross-chain transfer using ICTT
      logger.info(`🚀 Executing ICTT transfer...`);
      const tx = await contractWithSigner.send(
        targetConfig.blockchainId,
        targetConfig.contractAddress,
        actualRecipient,
        amountWei,
        gasLimit
      );

      const receipt = await tx.wait();
      logger.info(`✅ REAL ICTT cross-chain transfer completed! TX: ${receipt.hash}`);
      logger.info(`📊 Transferred ${amount} SIP from ${fromChain} to ${toChain}`);
      
      // Check balances after a delay to show the transfer result
      setTimeout(() => this.showBalanceDistribution(aiAgentAddress), 20000);
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status
      };
    } catch (error: any) {
      logger.error('❌ Cross-chain transfer failed:', error.message);
      throw error;
    }
  }

  // =======================================
  // QUERY FUNCTIONS
  // =======================================

  async getUserBalances(userAddress?: string): Promise<UserBalances> {
    try {
      // Always use AI agent address for real demo
      const targetAddress = userAddress || this.aiWallet.address;
      logger.info(`💰 Getting REAL balances for ${targetAddress}...`);
      
      const [fujiBalance, echoBalance, dispatchBalance] = await Promise.all([
        this.homeContract.userBalances(targetAddress).catch(() => ethers.parseEther("0")),
        this.echoContract.balanceOf(targetAddress).catch(() => ethers.parseEther("0")),
        this.dispatchContract.balanceOf(targetAddress).catch(() => ethers.parseEther("0"))
      ]);

      const fuji = ethers.formatEther(fujiBalance);
      const echo = ethers.formatEther(echoBalance);
      const dispatch = ethers.formatEther(dispatchBalance);
      const total = (parseFloat(fuji) + parseFloat(echo) + parseFloat(dispatch)).toString();

      return { fuji, echo, dispatch, total };
    } catch (error: any) {
      logger.error('Failed to get balances:', error.message);
      // Return zero balances if real query fails
      return { fuji: "0.0", echo: "0.0", dispatch: "0.0", total: "0.0" };
    }
  }

  async getSIPProgress(userAddress?: string): Promise<SIPProgress> {
    try {
      // Always use AI agent address for real demo
      const targetAddress = userAddress || this.aiWallet.address;
      const result = await this.homeContract.getSIPProgress(targetAddress);
      const [monthlyAmount, totalTarget, totalDeposited, percentComplete, nextDepositTime, isActive, automationEnabled, goal] = result;
      
      return {
        monthlyAmount: ethers.formatEther(monthlyAmount),
        totalTarget: ethers.formatEther(totalTarget),
        totalDeposited: ethers.formatEther(totalDeposited),
        percentComplete: Number(percentComplete),
        nextDepositTime: new Date(Number(nextDepositTime) * 1000),
        isActive,
        automationEnabled,
        goal
      };
    } catch (error: any) {
      logger.error('Failed to get SIP progress:', error.message);
      throw error;
    }
  }

  // ========================================
  // EMERGENCY FUNCTIONS
  // ========================================

  async activateEmergencyMode(chainName: string): Promise<TransactionResult> {
    try {
      logger.info(`🚨 Activating REAL emergency mode on ${chainName}`);
      
      let contract: any;
      let provider: ethers.JsonRpcProvider;

      if (chainName === 'echo') {
        contract = this.echoContract;
        provider = this.providers.get('echo')!;
      } else if (chainName === 'dispatch') {
        contract = this.dispatchContract;
        provider = this.providers.get('dispatch')!;
      } else {
        throw new Error(`Emergency mode not supported on ${chainName}`);
      }

      const wallet = new ethers.Wallet(
        process.env.AI_AGENT_PRIVATE_KEY || 'a3b5c293c2a3ea5bfe7a694e6ca11b5ece3b7a8b0374a62267f40a4068974550', 
        provider
      );
      const contractWithSigner = contract.connect(wallet);

      const tx = await contractWithSigner.aiActivateGlobalEmergency();
      const receipt = await tx.wait();
      
      logger.info(`✅ REAL emergency mode activated! TX: ${receipt.hash}`);
      
      return {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed?.toString(),
        status: receipt.status
      };
    } catch (error: any) {
      logger.error('Failed to activate emergency mode:', error.message);
      throw error;
    }
  }

  // =======================================
  // SERVICE LIFECYCLE
  // =======================================

  static async start(runtime: IAgentRuntime): Promise<Web3Service> {
    logger.info('🚀 *** Starting REAL Web3 Service ***');
    const service = new Web3Service(runtime);
    
    logger.info(`🔑 AI Agent Address: ${service.aiWallet.address}`);
    logger.info('🎯 Ready for REAL blockchain transactions!');
    
    return service;
  }

  static async stop(runtime: IAgentRuntime): Promise<void> {
    logger.info('*** Stopping Web3 Service ***');
    const service = runtime.getService(Web3Service.serviceType);
    if (service) {
      await service.stop();
    }
  }

  async stop(): Promise<void> {
    logger.info('*** Web3 Service stopped ***');
  }
}