// SPDX-License-Identifier: Ecosystem Approved License 0xD3f07713bB0D4816E23Ec66C666E0e7721C3b337
pragma solidity ^0.8.18;

import "./ITeleporterMessenger.sol";
import "./ITeleporterReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleEchoRemote is ERC20, ITeleporterReceiver, Ownable, ReentrancyGuard {
    ITeleporterMessenger public immutable teleporterMessenger;
    bytes32 public immutable homeBlockchainID;
    address public immutable homeTokenTransferrerAddress;
    uint8 private _decimals;
    
    // Simple yield tracking
    mapping(address => uint256) public yieldEarned;
    mapping(address => uint256) public lastUpdate;
    uint256 public yieldRate = 500; // 5% APY
    
    // AI agent
    address public aiAgent;
    
    event TokensMinted(address indexed recipient, uint256 amount);
    event TokensBurned(address indexed sender, uint256 amount);
    event YieldClaimed(address indexed user, uint256 amount);

    constructor(
        address teleporterMessengerAddress,
        address owner,
        bytes32 homeBlockchainID_,
        address homeTokenTransferrerAddress_,
        uint8 tokenDecimals_,
        string memory tokenName,
        string memory tokenSymbol
    ) ERC20(tokenName, tokenSymbol) Ownable(owner) {
        require(teleporterMessengerAddress != address(0), "Zero teleporter address");
        require(homeBlockchainID_ != bytes32(0), "Zero home blockchain ID");
        require(homeTokenTransferrerAddress_ != address(0), "Zero home address");
        
        teleporterMessenger = ITeleporterMessenger(teleporterMessengerAddress);
        homeBlockchainID = homeBlockchainID_;
        homeTokenTransferrerAddress = homeTokenTransferrerAddress_;
        _decimals = tokenDecimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function setAIAgent(address _aiAgent) external onlyOwner {
        aiAgent = _aiAgent;
    }

    // AI can adjust yield rate
    function aiUpdateYieldRate(uint256 newRate) external {
        require(msg.sender == aiAgent, "Only AI agent");
        require(newRate <= 1000, "Max 10% APY");
        yieldRate = newRate;
    }

    // Simple yield calculation
    function updateYield(address user) public {
        if (lastUpdate[user] == 0) {
            lastUpdate[user] = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - lastUpdate[user];
        uint256 userBalance = balanceOf(user);
        
        if (userBalance > 0 && timeElapsed > 0) {
            uint256 yield = (userBalance * yieldRate * timeElapsed) / (10000 * 365 days);
            yieldEarned[user] += yield;
        }
        
        lastUpdate[user] = block.timestamp;
    }

    function claimYield() external {
        updateYield(msg.sender);
        uint256 yield = yieldEarned[msg.sender];
        require(yield > 0, "No yield");
        
        yieldEarned[msg.sender] = 0;
        _mint(msg.sender, yield);
        
        emit YieldClaimed(msg.sender, yield);
    }

    function send(
        bytes32 destinationBlockchainID,
        address destinationTokenTransferrerAddress,
        address recipient,
        uint256 amount,
        uint256 requiredGasLimit
    ) external nonReentrant {
        require(amount > 0, "Zero amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        updateYield(msg.sender);
        _burn(msg.sender, amount);
        
        bytes memory message;
        if (destinationBlockchainID == bytes32(0) || destinationBlockchainID == homeBlockchainID) {
            message = abi.encode(recipient, amount);
        } else {
            message = abi.encode(destinationBlockchainID, recipient, amount);
        }
        
        teleporterMessenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: homeBlockchainID,
                destinationAddress: homeTokenTransferrerAddress,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: requiredGasLimit,
                allowedRelayerAddresses: new address[](0),
                message: message
            })
        );
        
        emit TokensBurned(msg.sender, amount);
    }

    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external override {
        require(msg.sender == address(teleporterMessenger), "Only Teleporter");
        require(originBlockchainID == homeBlockchainID, "Invalid origin blockchain");
        require(originSenderAddress == homeTokenTransferrerAddress, "Invalid origin sender");
        
        (address recipient, uint256 amount) = abi.decode(message, (address, uint256));
        
        if (lastUpdate[recipient] == 0) {
            lastUpdate[recipient] = block.timestamp;
        }
        
        _mint(recipient, amount);
        emit TokensMinted(recipient, amount);
    }

    function registerWithHome(uint256 requiredGasLimit) external onlyOwner {
        bytes memory registrationMessage = abi.encode(block.chainid, address(this));
        
        teleporterMessenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: homeBlockchainID,
                destinationAddress: homeTokenTransferrerAddress,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: requiredGasLimit,
                allowedRelayerAddresses: new address[](0),
                message: registrationMessage
            })
        );
    }
}