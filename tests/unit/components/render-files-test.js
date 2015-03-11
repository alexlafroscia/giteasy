import {
  moduleForComponent,
  test
} from 'ember-qunit';
import { repos as RepoFixtures } from '../../fixtures';

moduleForComponent('render-files', 'RenderFilesComponent', {
  // specify the other units that are required for this test
  needs: ['service:github']
});

test('it renders', function() {
  expect(2);

  // creates the component instance
  var component = this.subject({
    repo: RepoFixtures[0],
    path: '/'
  });
  equal(component._state, 'preRender');

  // appends the component to the page
  this.append();
  equal(component._state, 'inDOM');
});
