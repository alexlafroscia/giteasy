import Ember from 'ember';

export default Ember.Controller.extend({

  session: Ember.inject.service('github'),

  repo: Ember.computed.alias('session.currentRepo'),
  path: ''

});
