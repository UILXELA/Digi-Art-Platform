pragma solidity ^0.4.2;

//Art class for artwork
contract DigiArtPlat{
    // function DigiArtPlat() public{
    // }

    address[16] public user;

    enum ArtStates { hold, selling, auctioning, renting}
    struct Art{
        address owner;
        address[] users;
        address targetBuyer;
        address targetRenter;
        uint currentPrice;
        uint currentRent;       //rent per day
        uint currentBid;
        address winning;
        uint auctionStart;
        uint auctionDuration; //in hours
        mapping (address=>uint) rentStart;
        mapping (address=>uint) rentDuration; //in days
        mapping (address=>string) destination;
        mapping (address=>uint) userIndex;
        ArtStates state;
    }
    uint artID = 0;
    mapping (uint=>Art) arts;
    mapping (address=>uint) score;
    mapping (address=>uint) ratingCount;
    mapping (address=>uint) rating;
    mapping (uint=>address) toOwner;

    event Transfer(string txType, uint time, address from, address to, uint price);
    event Creation(uint time, address artist);


    modifier onlyOwner(Art a) {
        require(msg.sender == a.owner);
        _;
    }

    modifier notOwner(Art a) {
        require(msg.sender != a.owner);
        _;
    }

    function createArt() public returns(uint){
        arts[artID] = Art({
            owner: msg.sender,
            users: new address[](0),
            targetBuyer: address(0),
            targetRenter: address(0),
            currentPrice: 0,
            currentRent: 0,
            //rent per day
            currentBid: 0,
            winning: address(0),
            auctionStart: 0,
            auctionDuration: 0,
            state: ArtStates.hold
            });
        toOwner[artID] = msg.sender;
        artID = artID+1;
        return artID - 1;
    }

    function initiateSale(uint ID, uint _price, address _to) public onlyOwner(arts[ID]) {
        //artist can either set a target buyer or not(open sale)
        require(_to != address(this) && _to != arts[ID].owner);
        require(arts[ID].state == ArtStates.hold);

        arts[ID].state = ArtStates.selling;

        arts[ID].targetBuyer = _to;

        arts[ID].currentPrice = _price;
    }

    function initialRent(uint ID, uint _rent, address _to) public onlyOwner(arts[ID]){
        require(_to != address(this) && _to != arts[ID].owner);
        require(arts[ID].state == ArtStates.hold);

        arts[ID].state = ArtStates.renting;

        arts[ID].targetRenter = _to;

        arts[ID].currentRent = _rent;
    }

    function initiateAuction(uint ID, uint _price, uint duration) public onlyOwner(arts[ID]) {
        require(arts[ID].state == ArtStates.hold);

        arts[ID].state = ArtStates.auctioning;

        arts[ID].currentBid = _price;
        arts[ID].winning = arts[ID].owner;
        arts[ID].auctionStart = now;
        arts[ID].auctionDuration = duration;
    }

    function resetSale(uint ID) private {
        arts[ID].state = ArtStates.hold;
        arts[ID].targetBuyer = address(0);
    }

    function buy(uint ID) public notOwner(arts[ID]) payable {
        require(arts[ID].state == ArtStates.selling);
        require(msg.sender != arts[ID].owner);
        require(msg.sender == arts[ID].targetBuyer || arts[ID].targetBuyer == address(0));
        require(msg.value == arts[ID].currentPrice * 1 finney);

        // Change ownership
        address prevOwner = arts[ID].owner;
        address newOwner = msg.sender;
        uint salePrice = arts[ID].currentPrice;

        // Transaction cleanup
        resetSale(ID);

        prevOwner.transfer(salePrice* 1 finney);
        arts[ID].owner = newOwner;
        toOwner[artID] = newOwner;
        emit Transfer("buy", now, prevOwner, newOwner, salePrice);

        score[msg.sender] +=500;
        ratingCount[msg.sender] +=1;
        rating[msg.sender] = score[msg.sender]/ratingCount[msg.sender];

    }

    function rent(uint ID, uint start, uint duration, string destination)public notOwner(arts[ID]) payable returns(uint){
        //to subscribe, need to call this function
        require(arts[ID].state == ArtStates.renting);
        require(msg.sender == arts[ID].targetRenter);
        require(msg.value == arts[ID].currentRent * 1 finney);

        uint rentPrice = arts[ID].currentRent;
        arts[ID].users.push(msg.sender);
        uint index = arts[ID].users.length-1;
        arts[ID].userIndex[msg.sender] = index;
        arts[ID].owner.transfer(arts[ID].currentRent* 1 finney);
        arts[ID].rentStart[msg.sender] = now + start * 1 days;
        arts[ID].rentDuration[msg.sender] = duration;
        arts[ID].destination[msg.sender] = destination;
        emit Transfer("rent", now, arts[ID].owner, msg.sender, rentPrice);
        return index;
    }

    function endRent(uint ID, address _renter,uint rate) public onlyOwner(arts[ID]){
        require(rate<=500);
        uint start = arts[ID].rentStart[_renter];
        uint duration = arts[ID].rentDuration[_renter];
        require(now>=(start + duration * 1 days));
        delete arts[ID].users[arts[ID].userIndex[_renter]];

        score[msg.sender] +=rate;
        ratingCount[msg.sender] +=1;
        rating[msg.sender] = score[msg.sender]/ratingCount[msg.sender];
    }

    function bid(uint ID) public notOwner(arts[ID]) payable{
        require(now<=arts[ID].auctionStart+arts[ID].auctionDuration * 1 hours);
        require(arts[ID].state == ArtStates.auctioning);
        require(msg.value>arts[ID].currentBid*1 finney);
        arts[ID].winning.transfer(arts[ID].currentBid* 1 finney);
        //address prevWinning = arts[ID].winning;
        arts[ID].winning = msg.sender;
        arts[ID].currentBid = msg.value/1000000000000000;

    }

    function closeAuction(uint ID, uint rate) public onlyOwner(arts[ID]){
        require(arts[ID].state == ArtStates.auctioning);
        require(now>=arts[ID].auctionStart+arts[ID].auctionDuration * 1 hours+15 minutes); //duration is in hours
        if (arts[ID].winning == arts[ID].owner){
            arts[ID].currentBid = _price;
            arts[ID].winning = address(0);
            arts[ID].auctionStart = 0;
            arts[ID].auctionDuration = 0;
            arts[ID].state = ArtStates.hold;
        }else{
            address prevOwner = arts[ID].owner;
            uint _price = arts[ID].currentBid;
            address winner = arts[ID].winning;
            prevOwner.transfer(_price* 1 finney);
            arts[ID].owner = winner;
            toOwner[artID] = winner;
            emit Transfer("auction", now, prevOwner, winner, _price);
            require(rate<=500);
            score[msg.sender] += rate;
            ratingCount[msg.sender] += 1;
            rating[msg.sender] = score[msg.sender]/ratingCount[msg.sender];
        }

    }

    function checkRating(address user) public returns(uint){
        return rating[user];
    }

    //function subscribe(uint ID,) public notOwner(arts[ID]){

    //}

    function getUser() public view returns (address[16]) {
        return user;
    }


}
