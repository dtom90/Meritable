import * as React from 'react';
import renderer from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders without crashing`, () => {
  const tree = renderer.create(<ThemedText>Test text</ThemedText>).toJSON();
  
  expect(tree).toBeDefined();
});

