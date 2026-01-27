import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardBack } from './CardBack';

describe('CardBack', () => {
  test('renders card back with default styling', () => {
    const { container } = render(<CardBack />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('renders card back with custom className', () => {
    const { getByTestId } = render(<CardBack className="custom-class" />);
    const cardBack = getByTestId('card-back');
    expect(cardBack.classList.contains('custom-class')).toBe(true);
  });

  test('has testid for testing', () => {
    const { getByTestId } = render(<CardBack />);
    expect(getByTestId('card-back')).toBeTruthy();
  });
});
