import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.test\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)sx?'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/app/'],
};

export default config;
