const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const orderedTests = [];
    const testPaths = [
      "./tests/RegisterGraphql.test.js",
      "./tests/LoginGraphql.test.js",
      "./test/login.test.js",
    ];

    testPaths.forEach(path => {
      const matchingTests = tests.filter(test => test.path.endsWith(path));
      orderedTests.push(...matchingTests);
    });

    const remainingTests = tests.filter(test => !testPaths.some(path => test.path.endsWith(path)));
    orderedTests.push(...remainingTests);

    return orderedTests;
  }
}

module.exports = CustomSequencer;
