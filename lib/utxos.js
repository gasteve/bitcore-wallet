var http = require('http');
var https = require('https');
var url = require('url');

function isTLS(url) {
  return url.protocol === 'https:';
}

var args = program.args;
if (args[0] && fs.existsSync(args[0])) {
  console.error('Output file: "' + args[0] + '" already exists, not over-writing, aborting.');
  process.exit(-1);
}
var walletJSON = JSON.parse(fs.readFileSync(program.file));
var walletId = walletJSON.walletId;
var urlStr = program.url || 'http://127.0.0.1:3001';

function getUtxos(walletId, callback) {
  var parsedUrl = url.parse(urlStr);
  var httpOptions = {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (isTLS(parsedUrl) ? 443 : 80),
    method: 'GET',
    url: urlStr,
    path: '/wallet-api/wallets/' + walletId + '/utxos',
    body: ''
  };

  var req = (isTLS(parsedUrl) ? https : http).request(httpOptions, function(res) {

    function finish(err, body) {
      if (err) {
        return callback(err);
      }
      if (res.statusCode < 200 || res.statusCode > 299) {
        return callback(new Error('Response code from server was ' + res.statusCode));
      }
      var json;
      if (body) {
        try {
          json = JSON.parse(body);
        } catch(e) {
          return callback(e);
        }
        if (json.utxos) {
          return callback(null, json.utxos);
        } else {
          return callback(new Error('Response json not as expected - no utxos key in reply: ' + body));
        }
      }
      callback(new Error('no body in response.'));
    }

    res.on('error', finish);

    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      finish(null, body);
    });

  });

  req.on('error', callback);
  req.write('');
  req.end();
}

/*
getUtxos(walletId, function(err, utxos) {
  if(err) {
    throw err;
  }
  for (var i=0; i<utxos.length; i++) {
    process.stdout.write(JSON.stringify(utxos[i]));
    process.stdout.write('\n');
  }
});
*/

module.exports = getUtxos;
