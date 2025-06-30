// src/types/contracts.ts
// Real contract ABIs from your compiled Solidity contracts

export interface ChainConfig {
  chainId: number;
  rpcUrl: string;
  contractAddress: string;
  name: string;
  blockchainId: string;
}

export interface AllocationStrategy {
  fujiPercent: number;
  echoPercent: number;
  dispatchPercent: number;
}

export interface SIPProgress {
  monthlyAmount: string;
  totalTarget: string;
  totalDeposited: string;
  percentComplete: number;
  nextDepositTime: Date;
  isActive: boolean;
  automationEnabled: boolean;
  goal: string;
}

export interface UserBalances {
  fuji: string;
  echo: string;
  dispatch: string;
  total: string;
}

export interface TransactionResult {
  hash: string;
  blockNumber?: number;
  gasUsed?: string;
  status?: number;
}

// ========================================
// REAL CONTRACT ABIs FROM YOUR DEPLOYMENT
// ========================================

// ERC20TokenHome.sol ABI (Fuji Home Contract)
export const HOME_CONTRACT_ABI = [
  "function createSIP(uint256 monthlyAmount, uint256 totalTarget, uint256 intervalDays, string memory goal)",
  "function triggerUserDeposit(address user)",
  "function updateUserAllocation(address user, uint256 fujiPercent, uint256 echoPercent, uint256 dispatchPercent)",
  "function getSIPProgress(address user) view returns (uint256 monthlyAmount, uint256 totalTarget, uint256 totalDeposited, uint256 percentComplete, uint256 nextDepositTime, bool isActive, bool automationEnabled, string memory goal)",
  "function getUserAllocation(address user) view returns (uint256 fuji, uint256 echo, uint256 dispatch)",
  "function addAuthorizedAgent(address agent)",
  "function send(bytes32 destinationBlockchainID, address destinationTokenTransferrerAddress, address recipient, uint256 amount, uint256 requiredGasLimit)",
  "function makeSIPDeposit()",
  "function setUserAutomation(address user, bool enabled)",
  "function adjustUserAmount(address user, uint256 newAmount)",
  "function changeUserInterval(address user, uint256 newIntervalDays)",
  "function authorizedAgents(address) view returns (bool)",
  "function userBalances(address) view returns (uint256)",
  "function getActiveSIPCount() view returns (uint256)",
  "function globalAutomationPaused() view returns (bool)",
  "function toggleGlobalAutomation()"
];

// SimpleEchoRemote.sol ABI (Echo Chain Contract)
export const ECHO_CONTRACT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function send(bytes32 destinationBlockchainID, address destinationTokenTransferrerAddress, address recipient, uint256 amount, uint256 requiredGasLimit)",
  "function yieldEarned(address user) view returns (uint256)",
  "function claimYield()",
  "function updateYield(address user)",
  "function aiUpdateYieldRate(uint256 newRate)",
  "function setAIAgent(address _aiAgent)",
  "function yieldRate() view returns (uint256)",
  "function lastUpdate(address) view returns (uint256)",
  "function aiAgent() view returns (address)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// SimpleDispatchRemote.sol ABI (Dispatch Chain Contract) 
export const DISPATCH_CONTRACT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function send(bytes32 destinationBlockchainID, address destinationTokenTransferrerAddress, address recipient, uint256 amount, uint256 requiredGasLimit)",
  "function aiActivateGlobalEmergency()",
  "function aiDeactivateGlobalEmergency()",
  "function aiEmergencyWithdraw(address user, uint256 amount)",
  "function activateEmergencyMode()",
  "function lockFunds(uint256 duration)",
  "function setAIAgent(address _aiAgent)",
  "function emergencyMode(address) view returns (bool)",
  "function globalEmergency() view returns (bool)",
  "function lockUntil(address) view returns (uint256)",
  "function aiAgent() view returns (address)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// SIPToken.sol ABI (ERC20 Token)
export const SIP_TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];