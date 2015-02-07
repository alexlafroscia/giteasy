/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('bower_components/ember-uploader/dist/ember-uploader.named-amd.js');
app.import('bower_components/underscore/underscore.js');
app.import('bower_components/github-api/github.js');
app.import('bower_components/jquery/dist/jquery.min.js');
app.import('vendor/headerCanv.js');
app.import('vendor/mainLogin.js');
app.import("bower_components/ace-builds/src-noconflict/ace.js");
app.import("bower_components/ace-builds/src-noconflict/ace.js");
app.import("bower_components/ace-builds/src-noconflict/ace.js");

module.exports = app.toTree();
