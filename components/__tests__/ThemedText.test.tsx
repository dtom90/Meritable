import React from 'react';
import { render } from '@testing-library/react-native';

import { ThemedText } from '../ThemedText';

it(`renders without crashing`, () => {
  // NativeWind className is mocked in jest.setup.ts
  // Component renders but className styles aren't processed (expected in Jest)
  const { toJSON } = render(<ThemedText>Test text</ThemedText>);
  expect(toJSON()).toBeDefined();
});

it(`renders with different types`, () => {
  const { toJSON: defaultTree } = render(<ThemedText type="default">Default</ThemedText>);
  expect(defaultTree()).toBeDefined();

  const { toJSON: titleTree } = render(<ThemedText type="title">Title</ThemedText>);
  expect(titleTree()).toBeDefined();
});

it(`renders with custom style prop`, () => {
  const { toJSON } = render(
    <ThemedText style={{ fontSize: 20, color: '#000' }}>Styled text</ThemedText>
  );
  const tree = toJSON();
  expect(tree).toBeDefined();
  // Style prop should work even in Jest (className styles won't be applied, but style prop will)
});

