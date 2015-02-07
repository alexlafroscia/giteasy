import Ember from 'ember';

export default Ember.Controller.extend({

  repo: Ember.computed.alias('session.currentRepo'),
  path: Ember.computed.alias('model')

});
