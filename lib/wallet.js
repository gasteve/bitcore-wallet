'use strict';

var fs = require('fs');
var DEFAULT_WALLET = 'wallet.json';

function Wallet(opts) {
  if (!(this instanceof Wallet)) return new Wallet(opts);
  this.id = opts.id;
  this.publicKey = opts.publicKey;
  this.privateKey = opts.privateKey;
  this.masterKey = opts.masterKey;
  this.keys = opts.keys;
}

Wallet.fromArgs = function(program) {
  var obj = JSON.parse(fs.readFileSync(program.file || DEFAULT_WALLET));
  return new Wallet({
    id: obj.walletId,
    publicKey: obj.HDPublicKey,
    privateKey: obj.HDPrivateKey,
    masterKey: obj.masterKey,
    keys: obj.keys
  });
};

module.exports = Wallet;
