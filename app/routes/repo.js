import Ember from 'ember';

export default Ember.Route.extend({

  github: Ember.inject.service(),

  model: function(params) {
    return this.get('github').request(`repos/${params.owner_id}/${params.repo_id}`);
  }

});
