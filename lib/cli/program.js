module.exports = function(opts) {
  var answer = {};
  var program = require('commander');
  program.version('0.0.1');
  if (opts.server) {
    program.option('-u, --url <url>', 'Server URL');
  }
  if (opts.wallet) {
    program.option('-f, --file <walletFile>', 'Wallet file. Default: ./wallet.json');
  }
  program.parse(process.argv);
  if (opts.server) {
    answer.server = require('../server').fromArgs(program);
  }
  if (opts.wallet) {
    answer.wallet = require('../wallet').fromArgs(program);
  }
  return answer;
};
