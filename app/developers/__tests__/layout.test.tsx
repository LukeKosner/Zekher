import { test, expect } from 'bun:test';
import { render } from '@testing-library/react';
import DevelopersLayout, { metadata } from '../layout';

test('DevelopersLayout should render children directly', () => {
  const testContent = 'Test content for developers layout';
  const { getByText } = render(
    <DevelopersLayout>
      <div>{testContent}</div>
    </DevelopersLayout>
  );

  expect(getByText(testContent)).toBeInTheDocument();
});

test('DevelopersLayout should have correct metadata export', () => {
  expect(metadata).toBeDefined();
  expect(metadata.title).toBe('Developers - Zekher');
});