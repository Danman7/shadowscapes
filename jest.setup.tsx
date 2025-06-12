import '@testing-library/jest-dom'

jest.mock('react-icons/io5', () => {
  return {
    ...jest.requireActual('react-icons/io5'),
    IoHourglassOutline: () => <div data-testid="counter-icon" />,
    __esModule: true,
  }
})

jest.mock('react-icons/gi', () => {
  return {
    ...jest.requireActual('react-icons/gi'),
    GiBackForth: () => <div data-testid="retaliates-icon" />,
    __esModule: true,
  }
})

jest.mock('react-icons/im', () => {
  return {
    ...jest.requireActual('react-icons/im'),
    ImEyeBlocked: () => <div data-testid="hidden-icon" />,
    __esModule: true,
  }
})
