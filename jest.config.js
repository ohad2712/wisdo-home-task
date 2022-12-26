/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

module.exports = {
	preset: 'ts-jest',

	// The test environment that will be used for testing
	testEnvironment: 'node',

	// Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A path to a module which exports an async function that is triggered once before all test suites
  globalSetup: '<rootDir>/test/globalSetup.ts',

  // A path to a module which exports an async function that is triggered once after all test suites
  globalTeardown: '<rootDir>/test/globalTeardown.ts',

  // The regexp pattern or array of patterns that Jest uses to detect test files
  testRegex: [
    'test/.*\\.test\\.ts$',
  ],
};
