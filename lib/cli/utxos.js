var program = require('./program')({
  wallet: true, 
  server: true
});

program.server.getUtxos(program.wallet, function(err, utxos) {
  if(err) {
    throw err;
  }
  for (var i=0; i<utxos.length; i++) {
    process.stdout.write(JSON.stringify(utxos[i]));
    process.stdout.write('\n');
  }
});
