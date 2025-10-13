import '@testing-library/jest-dom'

export const instantIcon = 'instant-icon'

jest.mock('react-icons/gi', () => {
  return {
    ...jest.requireActual('react-icons/gi'),
    GiPowerLightning: () => <div data-testid={instantIcon} />,
    __esModule: true,
  }
})
