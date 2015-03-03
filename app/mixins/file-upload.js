import Ember from 'ember';

export default Ember.Mixin.create({

  classNames: ['file-upload'],
  classNameBindings: ['has-files:hasFiles'],

  fileIsHovering: false,
  enteredElement: null,
  newFiles: [],


  /**
   * Are there files to upload?
   */
  hasFiles: function() {
    return !Ember.isEmpty(this.get('newFiles'));
  }.property('newFiles'),


  /**
   * Handle file on drag enter.
   */
  dragEnter: function(event) {
    event.preventDefault();
    this.set('enteredElement', event.target);
    if (!this.get('fileIsHovering')) {
      this.set('fileIsHovering', true);
    }
  },


  /**
   * Prevents a dragged file from overwriting the current page.
   */
  dragOver: function(event) {
    event.preventDefault();
  },


  /**
   * Handle the file leaving the drag
   */
  dragLeave: function(event) {
    event.preventDefault();
    if (this.get('enteredElement') === event.target) {
      // Clean up UI
      this.set('fileIsHovering', false);
      this.set('enteredElement', null);
    }
  },


  /**
   * Handle adding a file on drop
   */
  drop: function(event) {
    event.preventDefault();
    if (this.get('enteredElement') === event.target) {
      var files = event.dataTransfer.files;
      this.set('newFiles', this.get('newFiles').concat(files));
    }
  },


  /**
   * Reset dragging a file onto the view
   */
  resetDraggingFile: function(event) {
  }

});
