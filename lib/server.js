var http = require('http');
var https = require('https');
var url = require('url');

var DEFAULT_URL = url.parse('http://127.0.0.1:3001');

function Server(opts) {
  if (!(this instanceof Server)) return new Server(opts);
  if (opts.url) {
    this.url = url.parse(opts.url);
  } else {
    this.url = DEFAULT_URL;
  }
}

Server.fromArgs = function(program) {
  var urlStr = program.url || DEFAULT_URL;
  return new Server({url: urlStr});
};

Server.prototype.get = function(path, callback) {
  var protocol = http;
  var defaultPort = 80;
  if (this.url.protocol === 'https') {
    protocol = https;
    defaultPort = 443;
  }
  var httpOptions = {
    protocol: this.url.protocol,
    hostname: this.url.hostname,
    port: this.url.port || defaultPort,
    method: 'GET',
    url: this.url.toString(),
    path: path,
    body: ''
  };
  return protocol.request(httpOptions, callback);
};

Server.prototype.getUtxos = function(wallet, callback) {
  var req = this.get('/wallet-api/wallets/' + wallet.id + '/utxos', function(res) {
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
					callback(null, json.utxos);
				} else {
					callback(new Error('Response json not as expected - no utxos key in reply: ' + body));
				}
			} else {
				callback(new Error('no body in response'));
			}
    }

    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      finish(null, body);
    });
    res.on('error', finish);
  });
  req.on('error', callback);
  req.write('');
  req.end();
};

module.exports = Server;
