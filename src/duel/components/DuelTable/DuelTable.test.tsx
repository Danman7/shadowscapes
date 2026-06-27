import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { DuelView } from './DuelTable';

test('renders the duel table grid', () => {
  render(<DuelView />);

  expect(screen.getByTestId('duel-view')).toHaveClass(
    'grid-cols-[100px_minmax(0,2fr)_100px]',
    'grid-rows-[140px_1fr_50px_1fr_140px]',
  );
});
