pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/DigiArtPlat.sol";

contract TestDigiArtPlat {
    DigiArtPlat plat = DigiArtPlat(DeployedAddresses.DigiArtPlat());

    // function testUserCanBuy() public {
    //     uint returnedId = plat.buy(8);

    //     uint expected = 8;

    //     Assert.equal(returnedId, expected, "Buy 8.");
    // }   
}