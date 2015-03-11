export function initialize(container, application) {
  application.inject('route', 'github', 'service:github');
  application.inject('component', 'github', 'service:github');
}

export default {
  name: 'github-service',
  initialize: initialize
};
