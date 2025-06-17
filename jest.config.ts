import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.tsx'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  cacheDirectory: '.jest-cache',
  coveragePathIgnorePatterns: ['src/GlobalStyle.ts'],
  transformIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/.husky/',
    '<rootDir>/.storybook/',
    '<rootDir>/.jest-cache/',
  ],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
  },
}

export default config
