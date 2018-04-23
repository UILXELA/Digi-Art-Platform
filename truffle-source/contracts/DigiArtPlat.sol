pragma solidity ^0.4.2;

//base class for artwork
contract item{
    address owner;

    function item(){
        owner = msg.sender;
        Transfer(now,address(0),owner,0);
    }
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function destroyContract() public onlyOwner {
        selfdestruct(owner);
    }

    function initiateSale(uint _price, address _to) onlyOwner public {
        require(_to != address(this) && _to != owner);
        require(!selling);

        selling = true;

        sellingTo = _to;

        askingPrice = _price;
      }

    function initiateAuction(uint _price) onlyOwner public {
        require(_to != address(this) && _to != owner);
        require(!selling);

        selling = true;

        startPrice = _price;
    }

    function resetSale() onlyOwner public {
        selling = false;
    }

    function cancelSale() onlyOwner public {
        require(selling);

      // Reset sale variables
        resetSale();
    }

    function completeSale() public payable {
        require(selling);
        require(msg.sender != owner);
        require(msg.sender == sellingTo);
        require(msg.value == askingPrice);

        // Swap ownership
        address prevOwner = owner;
        address newOwner = msg.sender;
        uint salePrice = askingPrice;

        owner = newOwner;

        // Transaction cleanup
        resetSale();

        prevOwner.transfer(salePrice);

        Transfer(now,prevOwner,newOwner,salePrice);
      }
}

contract Painting is item {
  //to be constructed
}
