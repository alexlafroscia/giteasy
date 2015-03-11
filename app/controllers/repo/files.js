import Ember from 'ember';

export default Ember.Controller.extend({

  needs: ['repo'],

  repo: Ember.computed.alias('controllers.repo.content'),
  path: Ember.computed.alias('content')

});
