// SPDX-License-Identifier: Ecosystem Approved License 0xa7E756116aC6b0819e0d7f7354C21417e1e0b2A7
pragma solidity ^0.8.18;

import "./ITeleporterMessenger.sol";
import "./ITeleporterReceiver.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleDispatchRemote is ERC20, ITeleporterReceiver, Ownable, ReentrancyGuard {
    ITeleporterMessenger public immutable teleporterMessenger;
    bytes32 public immutable homeBlockchainID;
    address public immutable homeTokenTransferrerAddress;
    uint8 private _decimals;
    
    // Emergency controls
    mapping(address => bool) public emergencyMode;
    mapping(address => uint256) public lockUntil;
    
    // AI agent
    address public aiAgent;
    bool public globalEmergency = false;
    
    event TokensMinted(address indexed recipient, uint256 amount);
    event TokensBurned(address indexed sender, uint256 amount);
    event EmergencyActivated(address indexed user);
    event EmergencyWithdraw(address indexed user, uint256 amount);

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

    // AI emergency controls
    function aiActivateGlobalEmergency() external {
        require(msg.sender == aiAgent, "Only AI agent");
        globalEmergency = true;
    }

    function aiDeactivateGlobalEmergency() external {
        require(msg.sender == aiAgent, "Only AI agent");
        globalEmergency = false;
    }

    function aiEmergencyWithdraw(address user, uint256 amount) external {
        require(msg.sender == aiAgent, "Only AI agent");
        require(balanceOf(user) >= amount, "Insufficient balance");
        
        _burn(user, amount);
        
        bytes memory message = abi.encode(user, amount);
        teleporterMessenger.sendCrossChainMessage(
            TeleporterMessageInput({
                destinationBlockchainID: homeBlockchainID,
                destinationAddress: homeTokenTransferrerAddress,
                feeInfo: TeleporterFeeInfo({
                    feeTokenAddress: address(0),
                    amount: 0
                }),
                requiredGasLimit: 250000,
                allowedRelayerAddresses: new address[](0),
                message: message
            })
        );
        
        emit EmergencyWithdraw(user, amount);
    }

    // User emergency controls
    function activateEmergencyMode() external {
        emergencyMode[msg.sender] = true;
        emit EmergencyActivated(msg.sender);
    }

    function lockFunds(uint256 duration) external {
        require(duration <= 30 days, "Max 30 days");
        lockUntil[msg.sender] = block.timestamp + duration;
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
        require(!globalEmergency, "Global emergency active");
        require(block.timestamp >= lockUntil[msg.sender], "Funds locked");
        
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