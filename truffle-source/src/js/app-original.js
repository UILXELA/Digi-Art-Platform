App = {
  web3Provider: null,
  contracts: {},

  dataLen: 0,
  dataArt: {},

  init: function() {
    // Load artworks.
    var that = this;
    $.getJSON('../artworks.json', function(data) {
      var artRow = $('#artRow');
      var artTemplate = $('#artTemplate');

      App.dataArt = data;
      App.dataLen = data.length;
      for (i = 0; i < data.length; i ++) {
        artTemplate.find('.panel-title').text(data[i].name);
        artTemplate.find('img').attr('src', data[i].picture);
        artTemplate.find('.author').text(data[i].author);
        artTemplate.find('.year').text(data[i].year);
        artTemplate.find('.price').text(data[i].price);
        artTemplate.find('.btn-buy').attr('data-id', data[i].id);
        artTemplate.find('.btn-rent').attr('data-id', data[i].id);
        artTemplate.find('.btn-bid').attr('data-id', data[i].id);

        artRow.append(artTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('DigiArtPlat.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PlatArtifact = data;
      App.contracts.DigiArtPlat = TruffleContract(PlatArtifact);
    
      // Set the provider for our contract
      App.contracts.DigiArtPlat.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markSuccess();
    });


    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('click', '.btn-rent', App.handleRent);
    $(document).on('click', '.btn-bid', App.handleAuc);
    $(document).on('submit', '#my-form', App.createArtwork);
    $(document).on('click', '.btn-ibuy', App.initBuy);
    $(document).on('click', '.btn-irent', App.initRent);
    $(document).on('click', '.btn-ibid', App.initAuc);
  },

  markSuccess: function(adopters, account) {
    var platInstance;

    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;

      return platInstance.getUser.call();
    }).then(function(user) {
      for (i = 0; i < user.length; i++) {
        if (user[i] !== "0x0000000000000000000000000000000000000000") {
          console.log(i + 'success');
          $('.panel-art').eq(i).find('.btn-buy').text('Success').attr('disabled', true);
          $('.panel-art').eq(i).find('.btn-rent').text('Success').css('display', "none");
          $('.panel-art').eq(i).find('.btn-bid').text('Success').css('display', "none");
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleBuy: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));

    var platInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
// ******************************************
        return platInstance.buy(artId, {from: account});
// ******************************************
      }).then(function(result) {
        return App.markSuccess();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleRent: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));

    var platInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
// ******************************************
        return platInstance.rent(artId, {from: account});
// ******************************************
      }).then(function(result) {
        return App.markSuccess();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleAuc: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));

    var platInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
// ******************************************
        return platInstance.bid(artId, {from: account});
// ******************************************
      }).then(function(result) {
        return App.markSuccess();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  createArtwork: function(event) {

    event.preventDefault();

    var artRow = $('#artRow');
    var artTemplate = $('#artTemplate');

    var name = document.forms["my-form"]["name"].value;
    var author = document.forms["my-form"]["author"].value;
    var year = document.forms["my-form"]["year"].value;
    var thumbnail = document.forms["my-form"]["thumbnail"].value;
    var desc = document.forms["my-form"]["description"].value;
    var mode = document.forms["my-form"]["mode"].value;
    var address = document.forms["my-form"]["address"].value;
    var price = document.forms["my-form"]["price"].value;
  

    var newArtId = App.dataLen + 1;


    artTemplate.find('.panel-title').text(name);
    artTemplate.find('img').attr('src', thumbnail);
    artTemplate.find('.author').text(author);
    artTemplate.find('.year').text(year);
    artTemplate.find('.price').text(price);
    artTemplate.find('.btn-buy').attr('data-id', newArtId);
    artTemplate.find('.btn-rent').attr('data-id', newArtId);
    artTemplate.find('.btn-bid').attr('data-id', newArtId);


    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;
// ******************************************
      return platInstance.createArt();
      
      // ******************************************
    }).then(function(result) {
      console.log("Art Created");
      artRow.append(artTemplate.html());
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },


  initBuy: function(event) {

    event.preventDefault();
    var address = "0x0000000000000000000000000000000000000000";
    var newArtId = 0;
    var price = 40;

    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;
// ******************************************
      if (address !== "")
        return platInstance.initiateSale(newArtId, price, address);
      else
        return platInstance.initiateSale(newArtId, price, "0x0000000000000000000000000000000000000000");
      // ******************************************
    }).then(function(result) {
      alert("Upload Successful!");
    }).catch(function(err) {
      console.log(err.message);
    });
  },


  initRent: function(event) {

    event.preventDefault();
    var address = "0x0000000000000000000000000000000000000000";

    var newArtId = 0;

    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;
// ******************************************
      if (address !== "")
        return platInstance.initialRent(newArtId, price, address);
      else
        return platInstance.initialRent(newArtId, price, "0x0000000000000000000000000000000000000000");
      // ******************************************
    }).then(function(result) {
      alert("Upload Successful!");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  initAuc: function(event) {

    event.preventDefault();

    var address = "0x0000000000000000000000000000000000000000";
    var newArtId = 0;


    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;
// ******************************************
      return platInstance.initiateAuction(newArtId, price, address);
      
      // ******************************************
    }).then(function(result) {
      alert("Upload Successful!");
    }).catch(function(err) {
      console.log(err.message);
    });
    

  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
