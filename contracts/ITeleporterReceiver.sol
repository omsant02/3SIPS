// SPDX-License-Identifier: Ecosystem Approved License
pragma solidity ^0.8.18;

interface ITeleporterReceiver {
    function receiveTeleporterMessage(
        bytes32 originBlockchainID,
        address originSenderAddress,
        bytes calldata message
    ) external;
}