pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DigiArtPlat.sol";

contract TestDigiArtPlat {
    DigiArtPlat plat = DigiArtPlat(DeployedAddresses.DigiArtPlat());
 
}