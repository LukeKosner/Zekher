import { test, expect } from 'bun:test';
import { render } from '@testing-library/react';
import AboutLayout, { metadata } from '../layout';

test('AboutLayout should render children directly', () => {
  const testContent = 'Test content for about layout';
  const { getByText } = render(
    <AboutLayout>
      <div>{testContent}</div>
    </AboutLayout>
  );

  expect(getByText(testContent)).toBeInTheDocument();
});

test('AboutLayout should have correct metadata export', () => {
  expect(metadata).toBeDefined();
  expect(metadata.title).toBe('About - Zekher');
});