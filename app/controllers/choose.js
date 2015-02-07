import Ember from 'ember';

export default Ember.ArrayController.extend({

  // Sort the content by name
  sortBy: ['name'],

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

    var arrangedContent = content.filter(function(item) {
      if (!Ember.isBlank(item.name)) {
        if (item.name.toLowerCase().indexOf(filter) >= 0) {
          return true;
        }
      }

      if (!Ember.isBlank(item.description)) {
        if (item.description.toLowerCase().indexOf(filter) >= 0) {
          return true;
        }
      }

      return false;
    });
    return arrangedContent;
  }.property('content', 'filter')

});
