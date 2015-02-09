import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({

  actions: {
    login: function() {
      var url = 'https://github.com/login/oauth/authorize?client_id=';
      url += config.API.GITHUB_CLIENT_ID;
      url += '&scope=user,repo';
      location.href = url;
    }
  }
});
