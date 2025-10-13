import '@testing-library/jest-dom'

export const instantIcon = 'instant-icon'
export const eliteIcon = 'elite-icon'

jest.mock('react-icons/gi', () => {
  return {
    ...jest.requireActual('react-icons/gi'),
    GiPowerLightning: () => <div data-testid={instantIcon} />,
    GiLaurels: () => <div data-testid={eliteIcon} />,
    __esModule: true,
  }
})
