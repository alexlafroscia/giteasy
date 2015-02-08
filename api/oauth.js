/* global require   */
/* global __dirname */
/* global process   */

var express = require('express');
var https = require('https');
var queryString = require('query-string');
var app = express();

// Github API Credentials
var githubClientID = 'a588178358290293b65d';
var githubClientSecret = process.env.GITEASY_GITHUB_CLIENT_SECRET;

// Set up client URL based on environment
var clientUrl;
if (app.get('env') === 'development') {
  clientUrl = 'http://localhost:3000';
} else {
  clientUrl = 'http://giteasy.alexlafroscia.com';
}


// Serve the HTML file from the root of the server
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});


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
      res.redirect(clientUrl + '/oauth?access_token=' + response.access_token);
    });

    postRes.on('error', function(error) {
      res.status(500).json({ error: error });
    });

  });

  postReq.end();
});


// Serve static files
// The wildcard route at the end allows the Ember app to serve the app at
// any given URL, which means that we can use the nice hashless routing
app.use('/assets/', express.static(__dirname + '/public/assets'));
app.use('/crossdomain.xml', express.static(__dirname + '/public'));
app.use('/robots.txt', express.static(__dirname + '/public'));
app.use('/*', express.static(__dirname + '/public/index.html'));


app.listen(3000);
