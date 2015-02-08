import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('render-files', 'RenderFilesComponent', {
  // specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('it renders', function() {
  expect(2);

  // creates the component instance
  var component = this.subject({
    path: '/'
  });
  equal(component._state, 'preRender');

  // appends the component to the page
  this.append();
  equal(component._state, 'inDOM');
});
