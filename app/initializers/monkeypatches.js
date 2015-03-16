import Ember from 'ember';

export function initialize() {

  /**
   * Adds a method to all strings to check whether or not they contain a
   * substring.  Uses the `.indexOf` method, and is really just syntactic sugar.
   */
  String.prototype.contains = function(search) {
    return this.indexOf(search) >= 0;
  }

}

export default {
  name: 'monkeypatches',
  initialize: initialize
};
