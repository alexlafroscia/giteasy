import Ember from 'ember';

export default Ember.Controller.extend({

  // The filter to search by
  filter: '',

  // Return the filtered content
  arrangedContent: function() {
    var content = this.get('content');
    var filter = this.get('filter').toLowerCase();

    // If the filter is empty, return all of the content
    if (Ember.isBlank(filter)) {
      return content;
    }

    return content.filter(function(item) {
      if (Ember.isPresent(item.name) && item.name.toLowerCase().contains(filter)) {
        return true;
      }

      if (Ember.isPresent(item.description) && item.description.toLowerCase().contains(filter)) {
        return true;
      }

      return false;
    });
  }.property('content', 'filter')

});
