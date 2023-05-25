/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  preset: 'ts-jest',
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  collectCoverage: true,
  // Coverage options
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
  ],
  coverageDirectory: 'build/coverage',
};
