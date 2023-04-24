// customTestSequencer.js
const { Sequencer  } = require('@jest/test-sequencer').default;

class CustomTestSequencer extends Sequencer  {
    sort(tests) {
        const orderPath = [
            '<rootDir>/tests/RegisterGraphql.test.js',
            '<rootDir>/tests/LoginGraphql.test.js',
            '<rootDir>/tests/login.test.js',
            '<rootDir>/tests/CreateConvo.test.js',
            '<rootDir>/tests/SendMessage.test.js'
          ];
          return tests.sort((testA, testB) => {
                const indexA = orderPath.indexOf(testA.path);
                const indexB = orderPath.indexOf(testB.path);
        
                if (indexA === indexB) return 0; // do not swap when tests both not specify in order.
        
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA < indexB ? -1 : 1;
          });
    }
}

module.exports = CustomTestSequencer;
