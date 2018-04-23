pragma solidity ^0.4.2;

//ArtBase class for artwork
contract ArtBase{
    string name;
    address owner;
    address user;
    address targetBuyer;
    uint currentPrice;

    enum artBaseStates { hold, selling, auctioning}
    artBaseStates state;

    event Transfer(string type, uint time, address from, address to, uint price);
    event Creation(uint time, address artist);


    function ArtBase(string name){
        owner = msg.sender;
        emit Creation(now, owner);
        state = artBaseStates.hold;
        name = name;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier notOwner {
        require(msg.sender != owner);
        _;
    }

    function destroyContract() public onlyOwner {
        selfdestruct(owner);
    }

    function initiateSale(uint _price, address _to) public onlyOwner {
        require(_to != address(this) && _to != owner);
        require(state == artBaseStates.hold);

        state = artBaseStates.selling;

        targetBuyer = _to;

        currentPrice = _price;
      }

    function initiateAuction(uint _price) public onlyOwner {
        require(_to != address(this) && _to != owner);
        require(state == artBaseStates.hold);

        state = artBaseStates.auctioning;

        currentPrice = _price;
    }

    function resetSale() private {
        state = artBaseStates.hold;
        targetBuyer = address(0);
    }

    function cancelDeal() public onlyOwner{
        require(state != artBaseStates.hold);

      // Reset sale variables
        resetSale();
    }

    function buy() public notOwner payable {
        require(selling);
        require(msg.sender != owner);
        require(msg.sender == targetBuyer);
        require(msg.value == currentPrice);

        // Change ownership
        address prevOwner = owner;
        address newOwner = msg.sender;
        uint salePrice = currentPrice;

        owner = newOwner;

        // Transaction cleanup
        resetSale();

        prevOwner.transfer(salePrice);

        emit Transfer( "buy", now, prevOwner, newOwner, salePrice);
      }

}

contract Painting is ArtBase {
  //to be constructed
}
