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
