/// <reference types="bun-types" />

import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { DuelView } from './DuelTable';

test('renders the duel table grid', () => {
  const html = renderToStaticMarkup(<DuelView />);

  expect(html).toContain('data-testid="duel-view"');
  expect(html).toContain('grid-cols-[100px_minmax(0,2fr)_100px]');
  expect(html).toContain('grid-rows-[140px_1fr_50px_1fr_140px]');
});
