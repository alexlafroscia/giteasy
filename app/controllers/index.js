import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    login: function() {
      location.href = "https://github.com/login/oauth/authorize?client_id=a588178358290293b65d&scope=user,repo";
    }
  }
});
