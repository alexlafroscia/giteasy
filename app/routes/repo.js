import Ember from 'ember';

export default Ember.Route.extend({

  model: function(params) {
    return this.github.request(`repos/${params.owner_id}/${params.repo_id}`);
  }

});
