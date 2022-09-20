/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transform: {
    '^.+\\.(t)s$': 'ts-jest',
    '^.+\\.(j)s$': 'babel-jest',
    // '^.+\\.(ts|js)$': 'ts-jest',
  },
  resolver: '<rootDir>/jest-resolver.cjs',
  transformIgnorePatterns: [
    // DOESNT WORK
    // '<rootDir>/node_modules/(?!snarkyjs/node_modules/tslib)',
    // THIS WORKS
    '<rootDir>/../../snarkyjs/node_modules/tslib',
    // DOESNT WORK
    // '<rootDir>/node_modules/tslib',
    // THIS WORKS
    '<rootDir>/snarkyjs/node_modules/tslib'
  ],
};
