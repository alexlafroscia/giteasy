import Ember from 'ember';

export default Ember.View.extend({
didInsertElement: function(){
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
}
});
