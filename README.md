# Giteasy

[![Build Status](https://travis-ci.org/alexlafroscia/giteasy.svg?branch=master)](https://travis-ci.org/alexlafroscia/giteasy)

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`


## Running / Development

* `ember server`
* npm run-script oauth
* Visit your app at [http://localhost:3000](http://localhost:3000).

## OAuth Server

In order to interact with Github's API, it's recommended that we use OAuth.  In order to do this in a secure manner, we need to have a server running that can handle the request.  So, I've developed a small, single-purpose Node server, using Express, that handles this requirement.  It can be found in `/api`.

To run the project locally, you'll likely need the OAuth server running locally, which can be started with

```bash
$ npm run-script oauth
```

In order to keep things nice and simple, the OAuth server can also be used to serve the Ember app in both development and production.  In production, it will serve the static files from `/api/public`.  In development, it will proxy all requests _not_ to the OAuth portion of the server to Ember's development server on port `4200`.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

