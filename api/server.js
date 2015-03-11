/* global require   */
/* global __dirname */
/* global process   */

var express = require('express');
var https = require('https');
var httpProxy = require('http-proxy');
var queryString = require('query-string');
var app = express();

// Github API Credentials
var githubClientID;
if (app.get('env') === 'development') {
  githubClientID = 'a588178358290293b65d';
} else {
  githubClientID = 'ec1183f326f9641b1899';
}
var githubClientSecret = process.env.GITEASY_GITHUB_CLIENT_SECRET;

if (app.get('env') === 'development') {
  app.set('port', 3000);
} else {
  app.set('port', process.env.PORT);
}

// Handle OAuth with Github's API
app.get('/api/oauth', function(req, res) {

  var response = '';

  var url = '/login/oauth/access_token';
  url += '?client_id=' + githubClientID;
  url += '&client_secret=' + githubClientSecret;
  url += '&code=' + req.query.code;

  var options = {
    hostname: 'github.com',
    path: url,
    port: 443,
    method: 'POST',
  };

  var postReq = https.request(options, function(postRes) {
    postRes.on('data', function(data) {
      response += data;
    });

    postRes.on('end', function() {
      response = queryString.parse(response);
      if (app.get('env') === 'development') {
        console.log(response);
      }
      res.redirect('/oauth?access_token=' + response.access_token);
    });

    postRes.on('error', function(error) {
      res.status(500).json({ error: error });
    });

  });

  postReq.end();
});


if (app.get('env') === 'development') {

  var emberProxy = httpProxy.createProxyServer();

  app.get("/*", function(req, res) {
    emberProxy.web(req, res, { target: 'http://0.0.0.0:5000' });
  });

} else {

  // Serve the HTML file from the root of the server
  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  // Serve static files
  // The wildcard route at the end allows the Ember app to serve the app at
  // any given URL, which means that we can use the nice hashless routing
  app.use('/assets/', express.static(__dirname + '/public/assets'));
  app.use('/crossdomain.xml', express.static(__dirname + '/public'));
  app.use('/robots.txt', express.static(__dirname + '/public'));
  app.use('/*', express.static(__dirname + '/public/index.html'));
}

app.listen(app.get('port'), function() {
  if (app.get('env') === 'development') {
    var port = app.get('port');
    console.log('+-----------------------------------------------------+');
    console.log('+ GitEasy server started on Port ' + port + '                 +');
    console.log('+ Server running in development mode                  +');
    console.log('+ Proxying requests to the Ember server through Node  +');
    console.log('+ Visit http://localhost:' + port + ' in your browser to view +');
    console.log('+-----------------------------------------------------+');
  }
});
