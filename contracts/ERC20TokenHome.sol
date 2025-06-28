// SPDX-License-Identifier: Ecosystem Approved License  0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337
pragma solidity ^0.8.18;

import "./ITeleporterMessenger.sol";
import "./ITeleporterReceiver.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ERC20TokenHome is ITeleporterReceiver, Ownable, ReentrancyGuard, AutomationCompatibleInterface {
    using SafeERC20 for IERC20;

    ITeleporterMessenger public immutable teleporterMessenger;
    IERC20 public immutable token;
    uint8 public immutable tokenDecimals;
    
    // Chain IDs
    bytes32 public constant ECHO_CHAIN_ID = 0x1278d1be4b987e847be3465940eb5066c4604a7fbd6e086900823597d81af4c1;
    bytes32 public constant DISPATCH_CHAIN_ID = 0x9f3be606497285d0ffbb5ac9ba24aa60346a9b1812479ed66cb329f394a4b1c7;
    
    mapping(bytes32 => address) public registeredRemotes;
    mapping(bytes32 => uint256) public tokensRouted;
    
    // SIP with Eliza Control
    struct SIPPlan {
        uint256 monthlyAmount;
        uint256 totalTarget;
        uint256 totalDeposited;
        uint256 lastDeposit;
        uint256 interval;
        bool isActive;
        bool automationEnabled;
        string goal;
    }
    
    struct AllocationStrategy {
        uint256 fujiPercent;
        uint256 echoPercent;
        uint256 dispatchPercent;
    }
    
    mapping(address => SIPPlan) public userSIPs;
    mapping(address => AllocationStrategy) public userAllocations;
    mapping(address => uint256) public userBalances;
    
    // Eliza Control
    mapping(address => bool) public authorizedAgents;
    bool public globalAutomationPaused;
    
    address[] public activeSIPUsers;
    
    event RemoteRegistered(bytes32 indexed remoteBlockchainID, address indexed remoteAddress);
    event TokensRouted(bytes32 indexed destinationBlockchainID, uint256 amount, address recipient);
    event TokensWithdrawn(address indexed recipient, uint256 amount);
    event MultiHopRouted(bytes32 indexed fromChain, bytes32 indexed toChain, uint256 amount, address recipient);
    event SIPCreated(address indexed user, uint256 monthlyAmount, uint256 totalTarget, string goal);
    event SIPDeposit(address indexed user, uint256 amount);
    event AutoDepositExecuted(address indexed user, uint256 amount);
    event AllocationUpdated(address indexed user, uint256 fuji, uint256 echo, uint256 dispatch);
    event AgentActionExecuted(address indexed agent, address indexed user, string action);

    constructor(
        address teleporterMessengerAddress,
        address owner,
        address tokenAddress,
        uint8 tokenDecimals_
    ) Ownable(owner) {
        require(teleporterMessengerAddress != address(0), "Zero teleporter address");
        require(tokenAddress != address(0), "Zero token address");
        
        teleporterMessenger = ITeleporterMessenger(teleporterMessengerAddress);
        token = IERC20(tokenAddress);
        tokenDecimals = tokenDecimals_;
    }

    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Only authorized agents");
        _;
    }

    // === SETUP FUNCTIONS ===
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }

    function removeAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = false;
    }

    function toggleGlobalAutomation() external onlyOwner {
        globalAutomationPaused = !globalAutomationPaused;
    }

    function registerRemote(bytes32 remoteBlockchainID, address remoteAddress) external onlyOwner {
        require(remoteAddress != address(0), "Zero remote address");
        registeredRemotes[remoteBlockchainID] = remoteAddress;
        emit RemoteRegistered(remoteBlockchainID, remoteAddress);
    }

    // === SIP CREATION ===
    function createSIP(
        uint256 monthlyAmount,
        uint256 totalTarget,
        uint256 intervalDays,
        string memory goal
    ) external {
        require(monthlyAmount > 0, "Monthly amount must be > 0");
        require(totalTarget > 0, "Total target must be > 0");
        require(intervalDays > 0, "Interval must be > 0");
        
        userSIPs[msg.sender] = SIPPlan({
            monthlyAmount: monthlyAmount,
            totalTarget: totalTarget,
            totalDeposited: 0,
            lastDeposit: block.timestamp,
            interval: intervalDays * 1 days,
            isActive: true,
            automationEnabled: true,
            goal: goal
        });
        
        // Default allocation: 30% Fuji, 60% Echo, 10% Dispatch
        userAllocations[msg.sender] = AllocationStrategy({
            fujiPercent: 30,
            echoPercent: 60,
            dispatchPercent: 10
        });
        
        if (!isUserInArray(msg.sender)) {
            activeSIPUsers.push(msg.sender);
        }
        
        emit SIPCreated(msg.sender, monthlyAmount, totalTarget, goal);
    }
    
    // === MANUAL DEPOSIT ===
    function makeSIPDeposit() external nonReentrant {
        _executeSIPDeposit(msg.sender);
    }
    
    // === ELIZA CONTROL FUNCTIONS ===
    function setUserAutomation(address user, bool enabled) external onlyAuthorizedAgent {
        userSIPs[user].automationEnabled = enabled;
        emit AgentActionExecuted(msg.sender, user, enabled ? "automation_enabled" : "automation_disabled");
    }
    
    function triggerUserDeposit(address user) external onlyAuthorizedAgent {
        _executeSIPDeposit(user);
        emit AgentActionExecuted(msg.sender, user, "immediate_deposit");
    }
    
    function updateUserAllocation(
        address user, 
        uint256 fujiPercent, 
        uint256 echoPercent, 
        uint256 dispatchPercent
    ) external onlyAuthorizedAgent {
        require(fujiPercent + echoPercent + dispatchPercent == 100, "Must equal 100%");
        
        userAllocations[user] = AllocationStrategy({
            fujiPercent: fujiPercent,
            echoPercent: echoPercent,
            dispatchPercent: dispatchPercent
        });
        
        emit AllocationUpdated(user, fujiPercent, echoPercent, dispatchPercent);
        emit AgentActionExecuted(msg.sender, user, "allocation_updated");
    }
    
    function adjustUserAmount(address user, uint256 newAmount) external onlyAuthorizedAgent {
        require(newAmount > 0, "Amount must be > 0");
        userSIPs[user].monthlyAmount = newAmount;
        emit AgentActionExecuted(msg.sender, user, "amount_adjusted");
    }
    
    function changeUserInterval(address user, uint256 newIntervalDays) external onlyAuthorizedAgent {
        require(newIntervalDays > 0, "Interval must be > 0");
        userSIPs[user].interval = newIntervalDays * 1 days;
        emit AgentActionExecuted(msg.sender, user, "interval_changed");
    }
    
    // === CHAINLINK AUTOMATION ===
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (globalAutomationPaused) {
            return (false, "");
        }
        
        address[] memory usersToProcess = new address[](activeSIPUsers.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < activeSIPUsers.length; i++) {
            address user = activeSIPUsers[i];
            SIPPlan memory plan = userSIPs[user];
            
            if (plan.isActive && 
                plan.automationEnabled &&
                plan.totalDeposited < plan.totalTarget &&
                block.timestamp >= plan.lastDeposit + plan.interval &&
                token.allowance(user, address(this)) >= plan.monthlyAmount &&
                token.balanceOf(user) >= plan.monthlyAmount) {
                usersToProcess[count] = user;
                count++;
            }
        }
        
        if (count > 0) {
            address[] memory finalUsers = new address[](count);
            for (uint256 i = 0; i < count; i++) {
                finalUsers[i] = usersToProcess[i];
            }
            upkeepNeeded = true;
            performData = abi.encode(finalUsers);
        }
    }
    
    function performUpkeep(bytes calldata performData) external override {
        address[] memory usersToProcess = abi.decode(performData, (address[]));
        
        for (uint256 i = 0; i < usersToProcess.length; i++) {
            _executeSIPDeposit(usersToProcess[i]);
            emit AutoDepositExecuted(usersToProcess[i], userSIPs[usersToProcess[i]].monthlyAmount);
        }
    }
    
    // === INTERNAL FUNCTIONS ===
    function _executeSIPDeposit(address user) internal {
        SIPPlan storage plan = userSIPs[user];
        require(plan.isActive, "No active SIP");
        require(plan.totalDeposited < plan.totalTarget, "Target already reached");
        
        uint256 depositAmount = plan.monthlyAmount;
        if (plan.totalDeposited + depositAmount > plan.totalTarget) {
            depositAmount = plan.totalTarget - plan.totalDeposited;
        }
        
        token.safeTransferFrom(user, address(this), depositAmount);
        
        plan.totalDeposited += depositAmount;
        plan.lastDeposit = block.timestamp;
        
        _distributeSIPFunds(user, depositAmount);
        
        emit SIPDeposit(user, depositAmount);
    }
    
    function _distributeSIPFunds(address user, uint256 amount) internal {
        AllocationStrategy memory allocation = userAllocations[user];
        
        uint256 fujiAmount = (amount * allocation.fujiPercent) / 100;
        uint256 echoAmount = (amount * allocation.echoPercent) / 100;
        uint256 dispatchAmount = (amount * allocation.dispatchPercent) / 100;
        
        userBalances[user] += fujiAmount;
        
        if (echoAmount > 0) {
            tokensRouted[ECHO_CHAIN_ID] += echoAmount;
            bytes memory echoMessage = abi.encode(user, echoAmount);
            
            teleporterMessenger.sendCrossChainMessage(
                TeleporterMessageInput({
                    destinationBlockchainID: ECHO_CHAIN_ID,
                    destinationAddress: registeredRemotes[ECHO_CHAIN_ID],
                    feeInfo: TeleporterFeeInfo({
                        feeTokenAddress: address(0),
                        amount: 0
                    }),
                    requiredGasLimit: 250000,
                    allowedRelayerAddresses: new address[](0),
                    message: echoMessage
                })
            );
            
            emit TokensRouted(ECHO_CHAIN_ID, echoAmount, user);
        }
        
        if (dispatchAmount > 0) {
            tokensRouted[DISPATCH_CHAIN_ID] += dispatchAmount;
            bytes memory dispatchMessage = abi.encode(user, dispatchAmount);
            
            teleporterMessenger.sendCrossChainMessage(
                TeleporterMessageInput({
                    destinationBlockchainID: DISPATCH_CHAIN_ID,
                    destinationAddress: registeredRemotes[DISPATCH_CHAIN_ID],
                    feeInfo: TeleporterFeeInfo({
                        feeTokenAddress: address(0),
                        amount: 0
                    }),
                    requiredGasLimit: 250000,
                    allowedRelayerAddresses: new address[](0),
                    message: dispatchMessage
                })
            );
            
            emit TokensRouted(DISPATCH_CHAIN_ID, dispatchAmount, user);
        }
    }

    // === ORIGINAL ICTT FUNCTIONS ===
    function send(
        bytes32 destinationBlockchainID,
        address destinationTokenTransferrerAddress,
        address recipient,
        uint256 amount,
        uint256 requiredGasLimit
    ) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(registeredRemotes[destinationBlockchainID] != address(0), "Remote not registered");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        tokensRouted[destinationBlockchainID] += amount;
        
        bytes memory message = abi.encode(recipient, amount);
        
        teleporterMessenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: destinationBlockchainID,
                destinationAddress: destinationTokenTransferrerAddress,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: requiredGasLimit,
                allowedRelayerAddresses: new address[](0),
                message: message
            })
        );
        
        emit TokensRouted(destinationBlockchainID, amount, recipient);
    }

    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        require(msg.sender == address(teleporterMessenger), "Only Teleporter");
        require(registeredRemotes[originBlockchainID] == originSenderAddress, "Invalid origin sender");
        
        if (message.length == 96) {
            (bytes32 finalDestination, address recipient, uint256 amount) = abi.decode(message, (bytes32, address, uint256));
            
            if (finalDestination == bytes32(0) || registeredRemotes[finalDestination] == address(0)) {
                require(tokensRouted[originBlockchainID] >= amount, "Insufficient routed tokens");
                tokensRouted[originBlockchainID] -= amount;
                token.safeTransfer(recipient, amount);
                emit TokensWithdrawn(recipient, amount);
            } else {
                require(tokensRouted[originBlockchainID] >= amount, "Insufficient routed tokens");
                tokensRouted[originBlockchainID] -= amount;
                tokensRouted[finalDestination] += amount;
                
                bytes memory routedMessage = abi.encode(recipient, amount);
                teleporterMessenger.sendCrossChainMessage(
                    TeleporterMessageInput({
                        destinationBlockchainID: finalDestination,
                        destinationAddress: registeredRemotes[finalDestination],
                        feeInfo: TeleporterFeeInfo({
                            feeTokenAddress: address(0),
                            amount: 0
                        }),
                        requiredGasLimit: 250000,
                        allowedRelayerAddresses: new address[](0),
                        message: routedMessage
                    })
                );
                
                emit MultiHopRouted(originBlockchainID, finalDestination, amount, recipient);
            }
        } else {
            (address recipient, uint256 amount) = abi.decode(message, (address, uint256));
            require(tokensRouted[originBlockchainID] >= amount, "Insufficient routed tokens");
            tokensRouted[originBlockchainID] -= amount;
            token.safeTransfer(recipient, amount);
            emit TokensWithdrawn(recipient, amount);
        }
    }
    
    // === VIEW FUNCTIONS ===
    function getSIPProgress(address user) external view returns (
        uint256 monthlyAmount,
        uint256 totalTarget,
        uint256 totalDeposited,
        uint256 percentComplete,
        uint256 nextDepositTime,
        bool isActive,
        bool automationEnabled,
        string memory goal
    ) {
        SIPPlan memory plan = userSIPs[user];
        uint256 percent = plan.totalTarget > 0 ? (plan.totalDeposited * 100) / plan.totalTarget : 0;
        
        return (
            plan.monthlyAmount,
            plan.totalTarget,
            plan.totalDeposited,
            percent,
            plan.lastDeposit + plan.interval,
            plan.isActive,
            plan.automationEnabled,
            plan.goal
        );
    }
    
    function getUserAllocation(address user) external view returns (uint256 fuji, uint256 echo, uint256 dispatch) {
        AllocationStrategy memory allocation = userAllocations[user];
        return (allocation.fujiPercent, allocation.echoPercent, allocation.dispatchPercent);
    }
    
    function isUserInArray(address user) internal view returns (bool) {
        for (uint256 i = 0; i < activeSIPUsers.length; i++) {
            if (activeSIPUsers[i] == user) return true;
        }
        return false;
    }
    
    function getActiveSIPCount() external view returns (uint256) {
        return activeSIPUsers.length;
    }
}