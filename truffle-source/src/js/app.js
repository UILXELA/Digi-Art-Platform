App = {
  web3Provider: null,
  contracts: {},

  dataLen: 0,
  dataArt: {},
  status1: [],

  init: function() {
    // Load artworks.
    var that = this;
    for (var i = 0; i< 9; i++) {
      App.status1[i] = [0,0,0];
    }

    return App.initWeb3();
  },

  initWeb3: function() {
    // Is there an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    users1 = [];
    $.getJSON('DigiArtPlat.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PlatArtifact = data;
      App.contracts.DigiArtPlat = TruffleContract(PlatArtifact);
    
      // Set the provider for our contract
      App.contracts.DigiArtPlat.setProvider(App.web3Provider);
    
      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
  
        return platInstance.getPrice.call();
      }).then(function(user) {
        users1 = user;
        
        $.getJSON('../artworks.json', function(data) {
          var artRow = $('#artRow');
          var artTemplate = $('#artTemplate');
    
          App.dataArt = data;
          App.dataLen = data.length;
          if ($("[data-page='home']").length!=0) {
            for (i = 0; i < data.length; i ++) {
              console.log(users1);
              if (users1[i]!=0) {
                artTemplate.find('.panel-title').text(data[i].name);
                artTemplate.find('img').attr('src', data[i].picture);
                artTemplate.find('.author').text(data[i].author);
                artTemplate.find('.year').text(data[i].year);
                artTemplate.find('.price').text(users1[i].c);
                artTemplate.find('.btn-buy').attr('data-id', data[i].id);
                artTemplate.find('.btn-rent').attr('data-id', data[i].id);
                artTemplate.find('.btn-bid').attr('data-id', data[i].id);
        
                artTemplate.find('.btn-ibuy').attr('data-id', data[i].id);
                artTemplate.find('.btn-irent').attr('data-id', data[i].id);
                artTemplate.find('.btn-ibid').attr('data-id', data[i].id);
                artTemplate.find('.btn-ica').attr('data-id', data[i].id);
                artTemplate.find('.btn-crent').attr('data-id', data[i].id);
                artTemplate.find('.btn-cbid').attr('data-id', data[i].id);
                artTemplate.find('.btn-cbuy').attr('data-id', data[i].id);
                artTemplate.find('.form-group').attr('data-id', data[i].id);
                artTemplate.find('.btn-rentconf').attr('data-id', data[i].id);
              }
              else
                continue;
    
              artRow.append(artTemplate.html());
            }
          }
          else {
            console.log("trverse");
            for (j = 0; j < data.length; j ++) {
              artTemplate.find('.panel-title').text(data[j].name);
              artTemplate.find('img').attr('src', data[j].picture);
              artTemplate.find('.author').text(data[j].author);
              artTemplate.find('.year').text(data[j].year);
              artTemplate.find('.price').attr('data-id', data[j].id).attr('placeholder', data[j].price);
              artTemplate.find('.btn-buy').attr('data-id', data[j].id);
              artTemplate.find('.btn-rent').attr('data-id', data[j].id);
              artTemplate.find('.btn-bid').attr('data-id', data[j].id);
      
              artTemplate.find('.btn-ibuy').attr('data-id', data[j].id);
              artTemplate.find('.btn-irent').attr('data-id', data[j].id);
              artTemplate.find('.btn-ibid').attr('data-id', data[j].id);
              artTemplate.find('.btn-ica').attr('data-id', data[j].id);
              artTemplate.find('.btn-crent').attr('data-id', data[j].id);
              artTemplate.find('.btn-cbid').attr('data-id', data[j].id);
              artTemplate.find('.btn-cbuy').attr('data-id', data[j].id);
              artTemplate.find('.form-group').attr('data-id', data[j].id);
              artTemplate.find('.btn-rentconf').attr('data-id', data[j].id);
    
    
              artRow.append(artTemplate.html());
            }
          }
          if ($('.author').length <= 1) {
            console.log("no item");
            $("#hint").show();
          }
          else
            $("#hint").hide();

          return App.markSuccess();
        });
  
      }).catch(function(err) {
        console.log(err.message);
      });


      

    });


    return App.bindEvents();
  },

  bindEvents: function() {

    console.log("调用bind");
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('click', '.btn-rent', App.handleRent);
    $(document).on('click', '.btn-bid', App.handleAuc);
    $(document).on('click', '.btn-ica', App.createArtwork);
    $(document).on('click', '.btn-ibuy', App.initBuy);
    $(document).on('click', '.btn-irent', App.initRent);
    $(document).on('click', '.btn-ibid', App.initAuc);
    $(document).on('click', '.btn-crent', App.clRent);
    $(document).on('click', '.btn-cbid', App.clAuc);
    $(document).on('click', '.btn-rentconf', App.handleRent2);

  },

  markSuccess: function(user, account) {

    event.preventDefault();
    var platInstance;

    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;

      return platInstance.getBuyer.call();
    }).then(function(user) {
      console.log(user);
      for (i = 0; i < user.length; i++) {
        if (user[i] !== "0x0000000000000000000000000000000000000000") {
          console.log(i + 'success');
          $('.panel-art').eq(i).find('.btn-ica').css("display", "none");
          $('.panel-art').eq(i).find('.btn-buy').css('display', "block").text('Sold').attr('disabled', true);
          $('.panel-art').eq(i).find('.btn-rent').css('display', "none");
          $('.panel-art').eq(i).find('.btn-bid').css('display', "none");
        }
        else {
          $('.panel-art').eq(i).find('.btn-ica').css("display", "block");
          $('.panel-art').eq(i).find('.btn-ibuy').css("display", "none");
          $('.panel-art').eq(i).find('.btn-irent').css("display", "none");
          $('.panel-art').eq(i).find('.btn-crent').css("display", "none");
          $('.panel-art').eq(i).find('.btn-ibid').css("display", "none");
          $('.panel-art').eq(i).find('.btn-cbid').css("display", "none");
          $('.panel-art').eq(i).find('.btn-cbuy').css("display", "none");
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handleBuy: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));


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
        console.log("Art bought");
        var strVar = "[data-id='"+String(artId)+"']";
        $(strVar + ".btn-buy").text('Sold').attr('disabled', true);
        $(strVar + ".btn-rent").css('display', "none");
        $(strVar + ".btn-bid").css('display', "none");
        
        App.markSuccess();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleRent: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));
    var strVar = "[data-id='"+String(artId)+"']";
    console.log(strVar);
    $(strVar + ".form-group").css('display') == "none" ? 
      $(strVar + ".form-group").css('display', "block"): $(strVar + ".form-group").css('display', "none");
    $(strVar + ".btn-rentconf").css('display') == "none" ? 
      $(strVar + ".btn-rentconf").css('display', "block"): $(strVar + ".btn-rentconf").css('display', "none");

  },

  handleRent2: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));


    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
// ******************************************
        return platInstance.rent(artId, 0, "s", {from: account});
        
// ******************************************
      }).then(function(result) {
        console.log("Art bought");
        var strVar = "[data-id='"+String(artId)+"']";
        $(strVar + ".btn-buy").text('Sold').attr('disabled', true);
        $(strVar + ".btn-rent").css('display', "none");
        $(strVar + ".btn-bid").css('display', "none");
        $(strVar + ".form-group").css('display', "none");
        $(strVar + ".btn-rentconf").css('display', "none");
        
        App.markSuccess();
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
        // return App.markSuccess();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  createArtwork: function(event) {

    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));

    var strVar = "[data-id='"+String(artId)+"']";
    var price = $(".price" + strVar).attr('placeholder');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
  // ******************************************
        return platInstance.createArt(artId, price, {from: account});
        
        // ******************************************
      }).then(function(result) {
        console.log("Art Created");
        var strVar = "[data-id='"+String(artId)+"']";
        $(strVar + ".btn-ica").css("display", "block").text("Done").attr('disabled', true);
        
        App.markSuccess();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
    
  },

  initBuy: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));

    var strVar = "[data-id='"+String(artId)+"']";
    var price = $(".price" + strVar).attr('placeholder');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      console.log(account);
      App.contracts.DigiArtPlat.deployed().then(function(instance) {
        platInstance = instance;
        return platInstance.initiateSale(artId, price);
        
      }).then(function(result) {
        console.log("init buy");
        App.status1[artId][0] = 1;
        $(strVar + ".btn-ibuy").css("display", "none");
        $(strVar + ".btn-cbuy").css("display", "block");
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },


  initRent: function(event) {
    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));

    var strVar = "[data-id='"+String(artId)+"']";
    var price = $(".price" + strVar).attr('placeholder');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      console.log(account);
    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;
        return platInstance.initialRent(artId, price);
        
    }).then(function(result) {
        console.log("init rent");
        $(strVar + ".btn-irent").css("display", "none");
        $(strVar + ".btn-crent").css("display", "block");
    }).catch(function(err) {
      console.log(err.message);
    });
    });
  },

  initAuc: function(event) {

    event.preventDefault();

    var artId = parseInt($(event.target).data('id'));


    var address = "0x0000000000000000000000000000000000000000";
    var newArtId = 0;


    App.contracts.DigiArtPlat.deployed().then(function(instance) {
      platInstance = instance;
// ******************************************
      return platInstance.initiateAuction(newArtId, price, address);
      
      // ******************************************
    }).then(function(result) {
      App.status1[artId][2] = 1;
      console.log("Upload Successful!");
    }).catch(function(err) {
      console.log(err.message);
    });
    

  },

  clRent: function(event) {
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
        // return App.markSuccess();
        App.status1[artId][1] = 0;
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  clAuc: function(event) {
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
        // return App.markSuccess();
        App.status1[artId][2] = 0;
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
