import Ember from 'ember';
import { request as ajax } from 'ic-ajax';

/**
 * Tools for accessing the Github API.
 *
 * @class Github
 * @extends Ember.Service
 * @constructor
 */
export default Ember.Service.extend({

  /**
   * The OAuth token to use with Github's API.
   *
   * @property accessToken
   * @type {String}
   * @default null
   */
  accessToken: null,


  init: function() {
    if (Ember.isPresent(localStorage.accessToken)) {
      this.set('accessToken', localStorage.accessToken);
    }
  },


  /**
   * Send request to the Github API.
   *
   * @method request
   * @param {String} url The URL to make the request to
   * @param {Object} data The options to make the AJAX request with
   * @return {Promise}
   */
  request: function(url, options) {
    // Reject promise if there's no access token
    if (Ember.isEmpty(this.get('accessToken'))) {
      return Ember.RSVP.reject({ error: 'Access token required' });
    }

    // Set up AJAX options
    var defaultOptions = {
      headers: {
        'Authorization': `token ${this.get('accessToken')}`
      },
      contentType: 'application/json',
      dataType: 'json'
    };

    options = Ember.$.extend(defaultOptions, options);
    return ajax(`https://api.github.com/${url}`, options);
  }

});
